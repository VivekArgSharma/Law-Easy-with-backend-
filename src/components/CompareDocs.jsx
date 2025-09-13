import React, { useState } from "react";
import "./CompareDocs.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
const apiKey = import.meta.env.VITE_API_KEY;


// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function CompareDocs() {
  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);
  const [uploaded1, setUploaded1] = useState(false);
  const [uploaded2, setUploaded2] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Gemini API setup
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Extract text from PDF file
  const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let textContent = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      text.items.forEach((item) => {
        textContent += item.str + " ";
      });
    }
    return textContent;
  };

  // Handle file input
  const handleFileUpload = async (e, setDoc, setUploaded) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => setDoc({ type: "text", content: event.target.result });
      reader.readAsText(file);
      setUploaded(true);
    } else if (file.type === "application/pdf") {
      const text = await extractPdfText(file);
      setDoc({ type: "text", content: text });
      setUploaded(true);
    } else if (file.type.startsWith("image/")) {
      setDoc({ type: "image", content: file });
      setUploaded(true);
    } else {
      alert("⚠️ Only TXT, PDF, and Image files are supported.");
    }
  };

  // Compare docs
  const handleCompare = async () => {
    if (!doc1 || !doc2) {
      alert("Please upload both documents before comparing!");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      let inputs = [];

      if (doc1.type === "text") {
        inputs.push(`Document 1:\n${doc1.content}`);
      } else if (doc1.type === "image") {
        inputs.push({ inlineData: { data: await toBase64(doc1.content), mimeType: doc1.content.type } });
      }

      if (doc2.type === "text") {
        inputs.push(`Document 2:\n${doc2.content}`);
      } else if (doc2.type === "image") {
        inputs.push({ inlineData: { data: await toBase64(doc2.content), mimeType: doc2.content.type } });
      }

      const prompt = `
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

      const response = await model.generateContent([prompt, ...inputs]);
      const text = await response.response.text();

      setResult(text);
    } catch (error) {
      console.error("Error comparing documents:", error);
      setResult("⚠️ Something went wrong while comparing documents.");
    }

    setLoading(false);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  return (
    <div className="compare-container">
      <h1>Compare Legal Documents</h1>

      <div className="input-section">
        {/* Upload for Document 1 */}
        <div>
          <label htmlFor="file-upload-1" className="filebutton">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {uploaded1 ? "Uploaded" : "Upload File"}
          </label>

          <input
            id="file-upload-1"
            type="file"
            accept=".txt,.pdf,image/*"
            onChange={(e) => handleFileUpload(e, setDoc1, setUploaded1)}
            style={{ display: "none" }}
          />
        </div>

        {/* Upload for Document 2 */}
        <div>
          <label htmlFor="file-upload-2" className="filebutton">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {uploaded2 ? "Uploaded" : "Upload File"}
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
          <div className="icon">
            <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path
                d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </button>
      </div>

      <div className="results">
        <h2>Differences Found</h2>
        {result ? (
          <div className="template-preview">
            <h2>Differences Found</h2>
            <pre>{result}</pre>
          </div>
        ) : (
          <p>No results yet.</p>
        )}
      </div>

      {/* Back to Home button */}
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
