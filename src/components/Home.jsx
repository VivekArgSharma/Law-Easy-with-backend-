
import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Scale, FileSignature } from "lucide-react"; // icons
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Summarize & Chat",
      icon: <FileText size={40} />,
      path: "/summarize",
      desc: "Quickly summarize and interact with legal text.",
    },
    {
      title: "Compare Documents",
      icon: <Scale size={40} />,
      path: "/compare",
      desc: "Find key differences and similarities easily.",
    },
    {
      title: "Generate Legal Document",
      icon: <FileSignature size={40} />,
      path: "/generate",
      desc: "Draft contracts and agreements instantly.",
    },
  ];

  return (
    <div className="home-container">
      <h1 className="home-title">Law Easy</h1>

      <p className="home-subtitle">Select a feature to continue:</p>

      <div className="card-grid">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{ animationDelay: `${idx * 0.2}s` }} // stagger animation
            onClick={() => navigate(f.path)}
          >
            <div className="icon-wrapper">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
  
}