🏛️ AI-ttorney – Demystifying Legal Documents with Gemini

A Generative AI-powered web app to summarize, compare, analyze, and generate Indian legal documents in simple language.
Built for the Google Gen AI Exchange Hackathon.

📌 Problem Statement

Legal documents are often long, complex, and full of jargon.

Common people struggle to understand what they’re signing.

Comparing two contracts or spotting hidden risks is hard.

Drafting legal documents usually requires expensive lawyers.

💡 Our Solution

AI-ttorney makes legal documents accessible, understandable, and actionable using Google Gemini models.

📑 Summarize & Explain: Upload a document (PDF, image, text). The AI gives a structured summary in plain English.

⚖️ Risk Analysis: Highlights issues, vague clauses, and unfair terms with risk levels (High/Medium/Low).

📊 Compare Documents: Paste or upload two documents → AI finds and lists key differences.

🛠️ Generate Legal Docs: Select a type (Rental Agreement, Partnership Deed, Will, etc.). The AI asks questions one by one and builds the final document.

🎲 Random Example Mode: Instantly generate a demo legal document with fake but realistic data.

🚀 Tech Stack

Frontend: React (Vite) + React Router

AI Models: Google Gemini 2.0 Flash (Q&A, chat, analysis) + Gemini 2.5 Pro (final document drafting)

Styling: Custom CSS

File Support: PDF, images, text

(Currently frontend-only; can be extended with a backend + DB like Supabase/Postgres for history & multi-user support.)

🔑 Features Demo
1. Summarization & Risk Analysis

Upload a legal doc → Get structured summary + risk map.

2. Document Comparison

Upload two docs → AI lists differences clearly.

3. Interactive Legal Doc Generator

Choose a doc type → AI interviews you question by question → Generate final draft.

4. Randomize Mode

Demo any legal document instantly with random but realistic data.

🛠️ Setup & Installation

Clone this repo:

git clone https://github.com/your-username/ai-ttorney.git
cd ai-ttorney


Install dependencies:

npm install


Add your Gemini API Key in the code:

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");


⚠️ For production, move the key to a backend or environment variable (never expose in public frontend).

Run the dev server:

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

🔐 Add backend + database (Supabase/Postgres) to store summaries & history.

🌍 Add multilingual support (Hindi, Kannada, Tamil, etc.).

🖊️ Allow editing AI-generated docs directly in app.

📑 Export options: PDF, DOCX.

🧑‍⚖️ Extend library of Indian legal templates.

👨‍💻 Team

Built by Natural Intelligence for the Google Gen AI Exchange Hackathon.

✨ “Making law simple, one document at a time.”
