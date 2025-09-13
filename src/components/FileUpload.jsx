import { Buffer } from "buffer";
import "./FileUpload.css";

function FileUpload({ setFile }) {
  async function handleFileUpload(event) {
    const fileUpload = await event.target.files[0].arrayBuffer();
    const file = {
      type: event.target.files[0].type,
      file: Buffer.from(fileUpload).toString("base64"),
      imageUrl: event.target.files[0].type.includes("pdf")
        ? "/document-icon.png"
        : URL.createObjectURL(event.target.files[0]),
    };
    console.log(file);
    setFile(file);
  }

  return (
    <section>
      <h2 className="head">Get Started</h2>

      <div className="btn-dzn">
        <label htmlFor="file-upload" className="filebutton">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Upload File
      </label>

      <input
        id="file-upload"
        type="file"
        accept=".pdf, .jpg, .jpeg, .png"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      </div>
    </section>
  );
}

export default FileUpload;
