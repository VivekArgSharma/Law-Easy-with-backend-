// src/components/LegalDocGenerator.jsx
import { useState } from "react";
import "./LegalDocGenerator.css";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function LegalDocGenerator() {
  const navigate = useNavigate();
  const [docType, setDocType] = useState("");
  const [template, setTemplate] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [finalDoc, setFinalDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [readyToGenerate, setReadyToGenerate] = useState(false);

  async function startChat() {
    if (!docType) {
      alert("Please select a document type first!");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/generator/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType }),
      });
      const data = await resp.json();
      setTemplate(data.template || "");
      setChatHistory([{ role: "assistant", text: data.firstQuestion || "What is your name?" }]);
    } catch (err) {
      console.error(err);
      setChatHistory([{ role: "assistant", text: "⚠️ Failed to start chat. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUserReply() {
    if (!userInput) return;
    const updated = [...chatHistory, { role: "user", text: userInput }];
    setChatHistory(updated);
    setUserInput("");
    setLoading(true);

    try {
      const conversation = updated.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");
      const resp = await fetch(`${API_BASE}/api/generator/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, conversation }),
      });
      const data = await resp.json();
      const text = data.text || "";

      if (text.includes("✅ All required info has been collected")) {
        setReadyToGenerate(true);
      }
      setChatHistory((h) => [...h, { role: "assistant", text }]);
    } catch (err) {
      console.error(err);
      setChatHistory((h) => [...h, { role: "assistant", text: "⚠️ Error. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function generateFinalDoc() {
    setLoading(true);
    try {
      const conversation = chatHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");
      const resp = await fetch(`${API_BASE}/api/generator/final`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, conversation }),
      });
      const data = await resp.json();
      setFinalDoc(data.text || "⚠️ Failed to generate the document.");
    } catch (err) {
      console.error(err);
      setFinalDoc("⚠️ Failed to generate the document.");
    } finally {
      setLoading(false);
    }
  }

  async function randomizeDoc() {
    if (!docType) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/generator/random`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType }),
      });
      const data = await resp.json();
      setFinalDoc(data.text || "⚠️ Failed to generate example.");
    } catch (err) {
      console.error(err);
      setFinalDoc("⚠️ Failed to generate example.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="generator-container">
      <h1 className="texty">Indian Legal Document Generator</h1>

      {!chatHistory.length && !finalDoc && (
        <div className="doc-selection">
          <h2 className="texty">Select Document Type</h2>
          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="Rental Agreement">Rental Agreement</option>
            <option value="Partnership Deed">Partnership Deed</option>
            <option value="Will">Will</option>
            <option value="Non-Disclosure Agreement">Non-Disclosure Agreement</option>
            <option value="Employment Contract">Employment Contract</option>
          </select>

          <div style={{ marginTop: "15px" }}>
            <button onClick={startChat} disabled={loading} style={{ marginRight: "10px" }}>
              {loading ? "Loading..." : "Start"}
            </button>
            {docType && (
              <button className="rand-btn" onClick={randomizeDoc} disabled={loading}>
                {loading ? "Generating..." : "Randomize Example"}
              </button>
            )}
          </div>
        </div>
      )}

      {template && !finalDoc && (
        <div className="template-preview">
          <h2>{docType} Template</h2>
          <pre>{template}</pre>
        </div>
      )}

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
            <input type="text" placeholder="Type your answer..." value={userInput} onChange={(e) => setUserInput(e.target.value)} />
            <button onClick={handleUserReply} disabled={loading}>
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>

          {readyToGenerate && (
            <div style={{ marginTop: "20px" }}>
              <button className="gen-btn" onClick={generateFinalDoc} disabled={loading}>
                {loading ? "Generating..." : `Generate ${docType}`}
              </button>
            </div>
          )}
        </div>
      )}

      {finalDoc && (
        <div className="template-preview">
          <h2>Generated {docType}</h2>
          <pre className="pre-size">{finalDoc}</pre>
        </div>
      )}

      <button className="back-button" onClick={() => navigate("/")}>
        ⬅ Back to Home
      </button>
    </div>
  );
}

export default LegalDocGenerator;
