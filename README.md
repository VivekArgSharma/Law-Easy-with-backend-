⚖️ Law Easy – Your AI-Powered Legal Assistant

“Understand, compare, and create legal documents with ease.”
Built using Google Gemini for the Gen AI Exchange Hackathon.

📌 Problem Statement

Legal documents are often:

Full of jargon that non-lawyers struggle to understand.

Time-consuming to read and compare.

Expensive to draft correctly without professional help.

💡 Our Solution

Law Easy makes legal processes simpler by combining Generative AI with an intuitive interface.

📑 Summarize Documents – Upload contracts, agreements, or notices and get clear, structured summaries in plain English.

⚠️ Spot Risks – Detect vague or unfair clauses, with priority ratings (High/Medium/Low).

📊 Compare Contracts – Upload two legal docs and instantly see the differences.

🛠️ Generate Legal Drafts – Select a document type (Rental Agreement, Partnership Deed, Will, NDA, etc.) → AI asks you questions step by step → Generates a proper draft.

🎲 Example Generator – Instantly create a sample legal document with random but realistic details.

🚀 Tech Stack

Frontend: React (Vite) + React Router

AI Models:

Gemini 2.0 Flash → For Q&A, summarization, and interactive chat

Gemini 2.5 Pro → For final document drafting (higher accuracy)

Styling: Custom CSS

File Support: PDF, images, and text

(Currently frontend-only; extendable with a backend + database for history & persistence.)

✨ Features Overview
1️⃣ Summarization & Risk Analysis

Upload any legal document → Get a structured breakdown + plain-English explanation.

Visual risk map shows fair vs risky clauses.

2️⃣ Document Comparison

Upload two files → See key differences in clauses and terms.

3️⃣ Interactive Document Generator

Choose a type → AI interviews you question by question → Generates final draft when you’re ready.

4️⃣ Random Example Mode

Quickly generate a demo version of any supported legal document.

🛠️ Setup & Installation

Clone the repo:

git clone https://github.com/your-username/law-easy.git
cd law-easy


Install dependencies:

npm install


Add your Gemini API Key:

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");


⚠️ Never expose this key in public deployments — use environment variables or a backend.

Run locally:

npm run dev

📂 Project Structure
src/
 ├── components/
 │    ├── Header.jsx
 │    ├── FileUpload.jsx
 │    ├── Summary.jsx
 │    ├── Chat.jsx
 │    ├── CompareDocs.jsx
 │    ├── LegalDocGenerator.jsx
 │    ├── Loader.jsx
 │
 ├── App.jsx
 ├── main.jsx
 ├── Home.jsx

🌟 Future Enhancements

🔐 Add backend + database (Supabase/Postgres) to store summaries & generated docs.

🌍 Provide multi-language support (Hindi, Kannada, Tamil, etc.).

🖊️ Enable direct editing of AI-generated documents.

📑 Export options: PDF / DOCX.

📚 Expand library of legal templates.

👨‍💻 Team

Built by [Your Name / Team Name] for the Google Gen AI Exchange Hackathon.

✨ “Law Easy makes legal documents simple, clear, and accessible for everyone.”