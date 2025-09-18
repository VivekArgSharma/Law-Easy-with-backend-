// server/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.GENAI_API_KEY;

if (!API_KEY) {
  console.error("ERROR: set GENAI_API_KEY in server/.env");
  process.exit(1);
}

const app = express();
// allow large payloads (base64 files)
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

// Instantiate models once
const genAI = new GoogleGenerativeAI(API_KEY);
const modelFlash = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
const modelPro = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });

// health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---------- Helpers ----------
const safeText = (maybe) => (maybe && typeof maybe === "string" ? maybe : "");

// ---------- /api/summarize ----------
app.post("/api/summarize", async (req, res) => {
  try {
    const { file } = req.body; // expect { data: "<base64>", mimeType: "application/pdf" }
    if (!file?.data) return res.status(400).json({ error: "missing file.data" });

    const prompt = `
You are an expert in Indian legal documents. Analyze the attached document and produce a clear, detailed explanation in simple language.
Follow the Step 1..4 instructions: identify type, paragraph explanation, bullet points, and a concluding short note.
Begin with: "This document is a [TYPE]"
Keep it readable for a non-lawyer.
    `;

    const response = await modelFlash.generateContent([
      { inlineData: { data: file.data, mimeType: file.mimeType } },
      prompt,
    ]);

    const text = await response.response.text();
    return res.json({ text });
  } catch (err) {
    console.error("summarize error:", err);
    return res.status(500).json({ error: safeText(err.message) || "server error" });
  }
});

// ---------- /api/issues ----------
app.post("/api/issues", async (req, res) => {
  try {
    const { file } = req.body;
    if (!file?.data) return res.status(400).json({ error: "missing file.data" });

    const prompt = `
You are a legal assistant AI analyzing Indian legal documents. Identify potential risks/issues and present them for a non-lawyer.
Rank risks High/Medium/Low and give a short explanation of each. Include an overall fairness % map.
    `;

    const response = await modelFlash.generateContent([
      { inlineData: { data: file.data, mimeType: file.mimeType } },
      prompt,
    ]);

    const text = await response.response.text();
    return res.json({ text });
  } catch (err) {
    console.error("issues error:", err);
    return res.status(500).json({ error: safeText(err.message) || "server error" });
  }
});

// ---------- /api/chat ----------
app.post("/api/chat", async (req, res) => {
  try {
    const { file, input, messages } = req.body;
    if (!file?.data) return res.status(400).json({ error: "missing file.data" });

    // include the whole chat history when asking
    const chatHistory = JSON.stringify(messages || []);
    const prompt = `
Answer this question as an Indian Legal Assistant about the attached document: ${input}

Answer as a chatbot with short messages and text only (no markdown, tags or symbols).
Chat history: ${chatHistory}
    `;

    const response = await modelFlash.generateContent([
      { inlineData: { data: file.data, mimeType: file.mimeType } },
      prompt,
    ]);

    const text = await response.response.text();
    return res.json({ text });
  } catch (err) {
    console.error("chat error:", err);
    return res.status(500).json({ error: safeText(err.message) || "server error" });
  }
});

// ---------- /api/compare ----------
app.post("/api/compare", async (req, res) => {
  try {
    const { doc1, doc2 } = req.body;
    if (!doc1 || !doc2) return res.status(400).json({ error: "doc1 and doc2 required" });

    const inputs = [];
    // If text doc, send as string. If image, include inlineData base64.
    if (doc1.type === "text") inputs.push(`Document 1:\n${doc1.content}`);
    else if (doc1.type === "image")
      inputs.push({ inlineData: { data: doc1.data, mimeType: doc1.mimeType } });

    if (doc2.type === "text") inputs.push(`Document 2:\n${doc2.content}`);
    else if (doc2.type === "image")
      inputs.push({ inlineData: { data: doc2.data, mimeType: doc2.mimeType } });

    const systemPrompt = `
You are a legal assistant AI. Compare two legal documents and provide the differences in this exact structure:
1. Document Type:
   - Document A: [type]
   - Document B: [type]
   - Comparison Note: ...
2. Overall Similarity: ...
3. Key Differences (by category):
   - Parties Involved: ...
   ...
4. Practical Legal Impact: ...
Make sure the output strictly follows the format.
    `;

    const response = await modelFlash.generateContent([systemPrompt, ...inputs]);
    const text = await response.response.text();
    return res.json({ text });
  } catch (err) {
    console.error("compare error:", err);
    return res.status(500).json({ error: safeText(err.message) || "server error" });
  }
});

// ---------- Generator: start/chat/final/random ----------

// start: returns template and the first question
app.post("/api/generator/start", async (req, res) => {
  try {
    const { docType } = req.body;
    if (!docType) return res.status(400).json({ error: "docType required" });

    const templatePrompt = `
You are a legal expert in Indian law.
Create a clean, professional template for a ${docType}.
Show placeholders like [NAME], [ADDRESS], [DATE].
Do not fill them, just show the structure.
    `;

    const startPrompt = `
You are a legal expert in Indian law.
I want to create a ${docType}.
Based on placeholders in the template, ask one question at a time (e.g. "What is your name?").
Do NOT generate the final document yet.
When all info is gathered, say exactly:
"✅ All required info has been collected. You can now generate your ${docType}."
    `;

    const templateResp = await modelFlash.generateContent(templatePrompt);
    const template = await templateResp.response.text();

    const startResp = await modelFlash.generateContent(startPrompt);
    const firstQuestion = await startResp.response.text();

    return res.json({ template, firstQuestion });
  } catch (err) {
    console.error("generator/start error:", err);
    return res.status(500).json({ error: safeText(err.message) || "server error" });
  }
});

// chat: next question or ready message
app.post("/api/generator/chat", async (req, res) => {
  try {
    const { docType, conversation } = req.body;
    if (!docType) return res.status(400).json({ error: "docType required" });

    const prompt = `
Document type: ${docType}

Conversation so far:
${conversation}

Rules:
- If more info is missing, ask ONLY the next specific question.
- Keep questions short and clear ("What is your address?").
- Do NOT generate the final document yet.
- When ALL placeholders are filled, say exactly:
  "✅ All required info has been collected. You can now generate your ${docType}."
    `;

    const response = await modelFlash.generateContent(prompt);
    const text = await response.response.text();
    return res.json({ text });
  } catch (err) {
    console.error("generator/chat error:", err);
    return res.status(500).json({ error: safeText(err.message) || "server error" });
  }
});

// final: generate final document (uses pro model)
app.post("/api/generator/final", async (req, res) => {
  try {
    const { docType, conversation } = req.body;
    if (!docType) return res.status(400).json({ error: "docType required" });

    const finalPrompt = `
Document type: ${docType}
Conversation so far:
${conversation}

Now generate the full and final ${docType} using the collected details.
Write it as a proper legal document.
    `;

    const response = await modelPro.generateContent(finalPrompt);
    const text = await response.response.text();
    return res.json({ text });
  } catch (err) {
    console.error("generator/final error:", err);
    return res.status(500).json({ error: safeText(err.message) || "server error" });
  }
});

// random example generator
app.post("/api/generator/random", async (req, res) => {
  try {
    const { docType } = req.body;
    if (!docType) return res.status(400).json({ error: "docType required" });

    const randomPrompt = `
You are a legal expert in Indian law.
Generate a fully filled ${docType} using random but realistic details (fake names, addresses, dates, numbers).
Ensure it looks like a proper legal document but is only for demo purposes.
    `;

    const response = await modelPro.generateContent(randomPrompt);
    const text = await response.response.text();
    return res.json({ text });
  } catch (err) {
    console.error("generator/random error:", err);
    return res.status(500).json({ error: safeText(err.message) || "server error" });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
