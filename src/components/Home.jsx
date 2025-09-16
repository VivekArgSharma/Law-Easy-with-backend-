import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">AI-ttorney</h1>
      <p className="home-subtitle">Select a feature to continue:</p>

      <div className="button-flex">
        <button
          className="gradient-btn"
          onClick={() => navigate("/summarize")}
        >
          <span>📄 Summarize & Chat</span>
        </button>

        <button
          className="gradient-btn"
          onClick={() => navigate("/compare")}
        >
          <span>🔍 Compare Documents</span>
        </button>

        <button
          className="gradient-btn"
          onClick={() => navigate("/generate")}
        >
          <span>📝 Generate Legal Document</span>
        </button>
      </div>
    </div>
  );
}
