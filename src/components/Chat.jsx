// src/components/Chat.jsx
import './Chat.css';
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Chat({ file }) {
  const [messages, setMessages] = useState([]); // { role, text }
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", text: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const payload = {
        file: { data: file.file, mimeType: file.type },
        input: trimmed,
        messages: newHistory,
      };

      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      const reply = data.text || "No response from server.";

      setMessages((m) => [...m, { role: "model", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: "error", text: "Error sending message, please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="chat-window">
      <h2>Chat</h2>

      {messages.length ? (
        <div className="chat">
          {messages.map((msg, i) => (
            <div className={msg.role} key={i}>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Ask any question about the uploaded document...</p>
      )}

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
          type="text"
          placeholder="Ask any question about the uploaded document..."
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </div>
    </section>
  );
}

export default Chat;
