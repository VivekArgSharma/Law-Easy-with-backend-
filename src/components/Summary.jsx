// src/components/Summary.jsx
import { useState, useEffect } from "react";
import Loader from "./Loader";
import "./Summary.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Summary({ file }) {
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [problems, setProblems] = useState("");
  const [probStatus, setProbStatus] = useState("idle");

  async function getSummary() {
    setStatus("loading");
    try {
      const resp = await fetch(`${API_BASE}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: { data: file.file, mimeType: file.type } }),
      });
      const data = await resp.json();
      setSummary(data.text || "No summary returned.");
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  async function getProblems() {
    setProbStatus("loading");
    try {
      const resp = await fetch(`${API_BASE}/api/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: { data: file.file, mimeType: file.type } }),
      });
      const data = await resp.json();
      setProblems(data.text || "No issues returned.");
      setProbStatus("success");
    } catch (err) {
      console.error(err);
      setProbStatus("error");
    }
  }

  useEffect(() => {
    if (status === "idle") getSummary();
  }, []);

  useEffect(() => {
    if (probStatus === "idle") getProblems();
  }, []);

  return (
    <section className="summary">
      <div className="img-container">
        <img src={file.imageUrl} alt="Preview" className="img-char" />
      </div>

      <div className="summary-problems">
        <div className="template-preview">
          <h2>Summary</h2>
          {status === "loading" ? <Loader /> : status === "success" ? <pre>{summary}</pre> : <p>Error getting the summary</p>}
        </div>

        <div className="template-preview">
          <h2>Issues</h2>
          {probStatus === "loading" ? <Loader /> : probStatus === "success" ? <pre>{problems}</pre> : <p>Error finding the issues in the document</p>}
        </div>
      </div>
    </section>
  );
}

export default Summary;
