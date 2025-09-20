// src/components/CompareDocs.jsx
import React, { useState } from "react";
import "./CompareDocs.css";
import * as pdfjsLib from "pdfjs-dist";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Configure PDF.js worker (still useful if you later want text extraction)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function CompareDocs() {
  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);
  const [uploaded1, setUploaded1] = useState(false);
  const [uploaded2, setUploaded2] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Utility: convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // strip prefix
      reader.onerror = (error) => reject(error);
    });

  const handleFileUpload = async (e, setDoc, setUploaded) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => setDoc({ type: "text", content: event.target.result });
      reader.readAsText(file);
      setUploaded(true);
    } else if (file.type === "application/pdf" || file.type.startsWith("image/")) {
      // Treat PDFs and images the same way: store file for base64 conversion later
      setDoc({ type: "binary", content: file });
      setUploaded(true);
    } else {
      alert("⚠️ Only TXT, PDF, and Image files are supported.");
    }
  };

  const handleCompare = async () => {
    if (!doc1 || !doc2) {
      alert("Please upload both documents before comparing!");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      let payloadDoc1;
      if (doc1.type === "text") {
        payloadDoc1 = { type: "text", content: doc1.content };
      } else {
        payloadDoc1 = {
          type: doc1.content.type.includes("pdf") ? "pdf" : "image",
          data: await toBase64(doc1.content),
          mimeType: doc1.content.type,
        };
      }

      let payloadDoc2;
      if (doc2.type === "text") {
        payloadDoc2 = { type: "text", content: doc2.content };
      } else {
        payloadDoc2 = {
          type: doc2.content.type.includes("pdf") ? "pdf" : "image",
          data: await toBase64(doc2.content),
          mimeType: doc2.content.type,
        };
      }

      const resp = await fetch(`${API_BASE}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc1: payloadDoc1, doc2: payloadDoc2 }),
      });

      const data = await resp.json();
      setResult(data.text || "No differences returned.");
    } catch (err) {
      console.error(err);
      setResult("⚠️ Something went wrong while comparing documents.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compare-container">
      <h1 className="heads">Compare Legal Documents</h1>

      <div className="input-section">
        <div>
          <label htmlFor="file-upload-1" className={`filebutton ${uploaded1 ? "uploaded" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {uploaded1 ? "✓ Document 1 Ready" : "Upload Document 1"}
          </label>

          <input
            id="file-upload-1"
            type="file"
            accept=".txt,.pdf,image/*"
            onChange={(e) => handleFileUpload(e, setDoc1, setUploaded1)}
            style={{ display: "none" }}
          />
        </div>

        <div>
          <label htmlFor="file-upload-2" className={`filebutton ${uploaded2 ? "uploaded" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {uploaded2 ? "✓ Document 2 Ready" : "Upload Document 2"}
          </label>

          <input
            id="file-upload-2"
            type="file"
            accept=".txt,.pdf,image/*"
            onChange={(e) => handleFileUpload(e, setDoc2, setUploaded2)}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="comp-btn-container">
        <button className="comp-btn" onClick={handleCompare} disabled={loading}>
          {loading ? "Comparing..." : "Find Differences"}
        </button>
      </div>

      <div className="results">
        <h2>Differences Found</h2>
        {result ? (
          <div className="template-preview">
            <pre>{result}</pre>
          </div>
        ) : (
          <p>No results yet.</p>
        )}
      </div>

      <button className="back-button" onClick={() => navigate("/")}>
        ⬅ Back to Home
      </button>
    </div>
  );
}
