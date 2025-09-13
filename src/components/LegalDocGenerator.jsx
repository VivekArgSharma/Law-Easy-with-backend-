import { useState } from "react";
import "./LegalDocGenerator.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
const apiKey = import.meta.env.VITE_API_KEY;


function LegalDocGenerator() {
  const navigate = useNavigate();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
  const model2 = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });

  const [docType, setDocType] = useState("");
  const [template, setTemplate] = useState(""); 
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [finalDoc, setFinalDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [readyToGenerate, setReadyToGenerate] = useState(false); // new state

  // Step 1: Generate template + start one-by-one Q&A
  async function startChat() {
    if (!docType) {
      alert("Please select a document type first!");
      return;
    }

    setLoading(true);

    try {
      const templatePrompt = `
        You are a legal expert in Indian law.
        Create a clean, professional template for a ${docType}.
        Show placeholders like [NAME], [ADDRESS], [DATE].
        Do not fill them, just show the structure.
      `;
      const templateResult = await model.generateContent(templatePrompt);
      const templateText = templateResult.response.text();
      setTemplate(templateText);

      const startPrompt = `
        You are a legal expert in Indian law.
        I want to create a ${docType}.
        Based on the placeholders in the template,
        ask me one question at a time (e.g. "What is your name?").
        Do not generate the document yet.
        When all info is gathered, say exactly:
        "✅ All required info has been collected. You can now generate your ${docType}."
      `;
      const startResult = await model.generateContent(startPrompt);
      const firstQuestion = startResult.response.text();

      setChatHistory([{ role: "assistant", text: firstQuestion }]);
    } catch (error) {
      console.error("Error starting chat:", error);
      setChatHistory([{ role: "assistant", text: "⚠️ Failed to start chat. Try again." }]);
    }

    setLoading(false);
  }

  // Step 2: Handle user replies
  async function handleUserReply() {
    if (!userInput) return;

    const updatedHistory = [...chatHistory, { role: "user", text: userInput }];
    setChatHistory(updatedHistory);
    setUserInput("");
    setLoading(true);

    try {
      const conversation = updatedHistory
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");

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

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (text.includes("✅ All required info has been collected")) {
        setReadyToGenerate(true);
        setChatHistory([...updatedHistory, { role: "assistant", text }]);
      } else {
        setChatHistory([...updatedHistory, { role: "assistant", text }]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
    }

    setLoading(false);
  }

  // Step 3: Generate final doc when button clicked
  async function generateFinalDoc() {
    setLoading(true);

    try {
      const conversation = chatHistory
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");

      const finalPrompt = `
        Document type: ${docType}
        Conversation so far:
        ${conversation}

        Now generate the full and final ${docType} using the collected details.
        Write it as a proper legal document.
      `;

      const result = await model2.generateContent(finalPrompt);
      const text = result.response.text();
      setFinalDoc(text);
    } catch (error) {
      console.error("Error generating final document:", error);
      setFinalDoc("⚠️ Failed to generate the document.");
    }

    setLoading(false);
  }

  // Step 4: Randomize with fake data
  async function randomizeDoc() {
    if (!docType) return;
    setLoading(true);

    try {
      const randomPrompt = `
        You are a legal expert in Indian law.
        Generate a fully filled ${docType} using random but realistic details
        (fake names, addresses, dates, numbers, etc.).
        Ensure it looks like a proper legal document but is only for demo purposes.
      `;

      const result = await model2.generateContent(randomPrompt);
      const text = result.response.text();
      setFinalDoc(text);
    } catch (error) {
      console.error("Error generating random document:", error);
      setFinalDoc("⚠️ Failed to generate example document.");
    }

    setLoading(false);
  }

  return (
    <div className="generator-container">
      <h1>Indian Legal Document Generator</h1>

      {/* Step 1: Selection */}
      {!chatHistory.length && !finalDoc && (
        <div className="doc-selection">
          <h2>Select Document Type</h2>
          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="Rental Agreement">Rental Agreement</option>
            <option value="Partnership Deed">Partnership Deed</option>
            <option value="Will">Will</option>
            <option value="Non-Disclosure Agreement">Non-Disclosure Agreement</option>
            <option value="Employment Contract">Employment Contract</option>
          </select>

          {/* Start & Randomize Buttons */}
          <div style={{ marginTop: "15px" }}>
            <button onClick={startChat} disabled={loading} style={{ marginRight: "10px" }}>
              {loading ? "Loading..." : "Start"}
            </button>
            {docType && (
              <button
                className="rand-btn"
                onClick={randomizeDoc}
                disabled={loading}
              >
                {loading ? "Generating..." : "Randomize Example"}
              </button>

            )}
          </div>
        </div>
      )}

      {/* Step 2: Show template */}
      {template && !finalDoc && (
        <div className="template-preview">
          <h2>{docType} Template</h2>
          <pre>{template}</pre>
        </div>
      )}

      {/* Step 3: Chat */}
      {chatHistory.length > 0 && !finalDoc && (
        <div className="chatbox">
          <h2>{docType} – Fill in Details</h2>
          <div className="chat-history">
            {chatHistory.map((msg, i) => (
              <p key={i} className={msg.role}>
                <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong> {msg.text}
              </p>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="Type your answer..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button onClick={handleUserReply} disabled={loading}>
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>

          {readyToGenerate && (
            <div style={{ marginTop: "20px" }}>
              <button
                className="gen-btn"
                onClick={generateFinalDoc}
                disabled={loading}
              >
                {loading ? "Generating..." : `Generate ${docType}`}
              </button>

            </div>
          )}
        </div>
      )}

      {/* Step 4: Show final doc */}
      {finalDoc && (
        <div className="template-preview">
          <h2>Generated {docType}</h2>
          <pre className="pre-size">{finalDoc}</pre>
        </div>
      )}

      {/* Back to Home */}
      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        ⬅ Back to Home
      </button>
    </div>
  );
}

export default LegalDocGenerator;
