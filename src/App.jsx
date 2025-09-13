import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import FileUpload from "./components/FileUpload.jsx";
import Summary from "./components/Summary.jsx";
import Chat from "./components/Chat.jsx";
import CompareDocs from "./components/CompareDocs.jsx";
import Home from "./components/Home.jsx";
import LegalDocGenerator from "./components/LegalDocGenerator.jsx";

// Wrapper for Summary + Chat flow
function SummaryAndChat() {
  const [uploadedFile, setUploadedFile] = useState(null);

  return (
    <main className="container">
      <Header />
      {uploadedFile ? (
        <>
          <Summary file={uploadedFile} />
          <Chat file={uploadedFile} />
        </>
      ) : (
        <FileUpload setFile={setUploadedFile} />
      )}
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/summarize" element={<SummaryAndChat />} />
      <Route path="/compare" element={<CompareDocs />} />
      <Route path="/generate" element={<LegalDocGenerator />} />
    </Routes>
  );
}

export default App;
