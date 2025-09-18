
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
You are an expert in Indian legal documents.  
Your task is to analyze any given legal document and produce a clear, detailed explanation in simple language.  

### Step 1: Identify the type of document
Classify the document into one of the following categories:
1. Personal Legal Document  
2. Property & Real Estate Document  
3. Business & Commercial Document  
4. Court & Litigation Document  
5. Taxation & Financial Document  
6. Intellectual Property Document  
7. Government & Regulatory Document  

### Step 2: Summarize using a hybrid style
- Use **paragraphs** to explain meaning, context, and importance.  
- Use **bullet points** when listing key details for clarity.  
- Always keep language simple, but cover all important legal aspects.  

### Step 3: Cover the key points for the detected category
For each category, make sure to address the following:  

**Personal Legal Documents**  
- Name of the person(s) concerned.  
- Date of issue / validity (if applicable).  
- Issuing authority (Municipality, UIDAI, Passport office, etc.).  
- What fact/status it certifies (birth, marriage, identity, etc.).  
- Where and how it can be used (govt services, legal proof, banking, etc.).  
- Why it is important legally.  

**Property & Real Estate Documents**  
- Names of parties (buyer/seller, lessor/lessee, donor/recipient).  
- Nature of transaction (sale, lease, mortgage, gift, inheritance).  
- Description of property (location, size, type).  
- Consideration (price/rent/loan amount if applicable).  
- Rights and obligations transferred.  
- Registration details (stamp duty, Sub-Registrar’s office).  
- Why it is legally enforceable.  

**Business & Commercial Documents**  
- Parties involved (partners, employer/employee, companies).  
- Type of agreement (partnership, NDA, employment, franchise, loan, etc.).  
- Key rights and obligations of each side.  
- Duration / validity of the agreement.  
- Governing law / jurisdiction (if mentioned).  
- How it protects parties legally.  

**Court & Litigation Documents**  
- Court name and type (civil, criminal, high court, etc.).  
- Parties involved (plaintiff/defendant, petitioner/respondent).  
- Nature of the case (dispute, criminal charge, writ petition, etc.).  
- Relief sought / allegation made.  
- Court’s order, decree, or judgment (if given).  
- Current status (pending, decided, execution).  
- Legal importance.  

**Taxation & Financial Documents**  
- Name and details of taxpayer (PAN, GSTIN, etc.).  
- Period/year of assessment.  
- Type of tax/finance involved (income tax, GST, property tax, loan).  
- Amount declared, paid, or due.  
- Issuing authority (Income Tax Dept, GST authority, Municipality, Bank).  
- Proof value (for compliance, loans, audits).  
- Why it is important.  

**Intellectual Property Documents**  
- Name of applicant/owner.  
- Type of IP (patent, copyright, trademark, design).  
- Subject matter (invention, logo, literary work, product design).  
- Registration number and date.  
- Duration/validity of protection.  
- Rights granted (exclusive use, right to prevent infringement).  
- Why it is important.  

**Government & Regulatory Documents**  
- Name of licensee/organization.  
- License/permit type (trade, FSSAI, pollution clearance, PF/ESI registration).  
- Issuing authority (municipality, government dept, regulatory body).  
- Purpose of license (business operation, compliance).  
- Validity period / renewal requirements.  
- Conditions/restrictions (if any).  
- Legal significance.  

### Step 4: Output format
- Begin with: “This document is a [TYPE]”  
- Provide a **paragraph-style explanation** of what it means and why it matters.  
- Use **bullet points** for structured details based on the above category points.  
- End with a concluding note in simple words: “In short, this document serves as…”  


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
        You are a legal assistant AI that analyzes Indian legal documents. Your task is to carefully read the document, identify potential risks/issues, and present them in a simple but detailed way so that a non-lawyer can understand.

Steps to follow:

Identify the document type (e.g., Contract, Employment Agreement, Lease, Will, Loan Agreement, Partnership Deed, Sale Deed, Power of Attorney, Privacy Policy, Terms & Conditions, MoU, Affidavit, Legal Notice, Court Order, Insurance Policy, Service Agreement).

Summarize the document in clear, simple paragraphs explaining its purpose and key clauses.

Risk & Issue Detection → Scan for and highlight risks such as:

Contracts & Agreements → Unclear obligations, penalty clauses, one-sided termination, hidden fees, arbitration bias.

Employment Agreements → Non-compete restrictions, unfair termination, salary withholding, overtime ambiguity, unclear benefits.

Lease/Rent Agreements → Sudden eviction clauses, rent hike terms, repair liability, hidden maintenance costs.

Wills & Testamentary Documents → Ambiguous beneficiaries, invalid execution, exclusion of legal heirs, unclear executor powers.

Loan Agreements → High hidden fees, prepayment penalties, default clauses, collateral seizure rights.

Partnership Deeds → Unequal profit-sharing, vague partner exit clauses, dispute settlement gaps.

Sale Deeds → Missing ownership warranties, hidden liabilities, unclear possession handover, stamp duty issues.

Power of Attorney → Broad powers without limits, misuse risk, revocation issues.

Privacy Policies / T&Cs → Unclear data usage, auto-renewals, no refund policy, jurisdiction bias.

Insurance Policies → Ambiguous coverage, hidden exclusions, claim rejection loopholes.

Court Orders / Legal Notices / Affidavits → Compliance timelines, penalties, enforceability doubts.

Rank Risks by Severity & Impact → Present findings like this:

🔴 High Risk: Critical clauses that can cause financial/legal harm.

🟡 Medium Risk: Potentially unfair but negotiable clauses.

🟢 Low Risk: Minor inconveniences or small fees.

Explain Each Risk in Simple Language → For every risk, explain what it means and how it could affect the person.

Visual Risk Map (Overall Fairness Score):

Show % of fairness, medium risk, and high risk.

Example: “This contract is 60% fair, 25% medium risk, 15% high risk.”
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

    const systemPrompt =  `
You are a legal assistant AI. Compare two legal documents and provide the differences in a structured format. Follow this exact structure in every response:

1. Document Type:
   - Document A: [type]
   - Document B: [type]
   - Comparison Note: [e.g., "Both are contracts" or "Different legal types"]

2. Overall Similarity:
   - [State if they are identical, mostly similar, or completely different]

3. Key Differences (List category by category):
   - Parties Involved: [difference or "Same"]
   - Dates & Duration: [difference or "Same"]
   - Obligations & Duties: [difference or "Same"]
   - Rights Granted: [difference or "Same"]
   - Restrictions / Limitations: [difference or "Same"]
   - Payment Terms: [difference or "Same"]
   - Termination Clauses: [difference or "Same"]
   - Liabilities & Indemnities: [difference or "Same"]
   - Dispute Resolution: [difference or "Same"]
   - Confidentiality: [difference or "Same"]
   - Miscellaneous Clauses: [difference or "Same"]

4. Practical Legal Impact:
   - [Explain how the differences could affect the parties in plain English]

Make sure the output strictly follows this format every time.
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
