function UploadCard({
  file,
  setFile,
  detectDocumentType,
  detectDocumentLanguage,
  documentType,
  setDocumentType,
  documentLanguage,
  setDocumentLanguage,
  outputLanguage,
  setOutputLanguage,
  uploadFile,
  Loading,
}) {
  return (
    <>
      <input
        id="fileInput"
        type="file"
        style={{ display: "none" }}
        onChange={(e) => {
          const selectedFile = e.target.files[0];

          if (!selectedFile) return;

          setFile(selectedFile);
          detectDocumentType(selectedFile);
          detectDocumentLanguage(selectedFile);
        }}
      />

      <label htmlFor="fileInput" className="file-button">
        {file ? file.name : "📂 Choose Document"}
      </label>

      <br />
      <br />

      <label>
        <strong>Document Type</strong>
      </label>

      <br />

      <select
        className="document-type"
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value)}
      >
        <option>Auto Detect</option>
        <option>Research Paper</option>
        <option>Resume / CV</option>
        <option>Legal Contract</option>
        <option>Business Report</option>
        <option>Financial Report</option>
        <option>Medical Report</option>
        <option>Story / Novel</option>
        <option>Meeting Minutes</option>
        <option>Technical Documentation</option>
        <option>Personal Note</option>
        <option>Biography</option>
        <option>Student Assignment</option>
        <option>Other</option>
      </select>

      <br />

      <label>
        <strong>Document Language</strong>
      </label>

      <br />

      <select
        className="document-type"
        value={documentLanguage}
        onChange={(e) => setDocumentLanguage(e.target.value)}
      >
        <option>Auto Detect</option>
        <option>English</option>
        <option>Urdu</option>
        <option>Arabic</option>
        <option>Spanish</option>
        <option>French</option>
        <option>German</option>
        <option>Chinese</option>
        <option>Hindi</option>
        <option>Other</option>
      </select>

<br />

<label>
  <strong>Output Language</strong>
</label>

<br />

<select
  className="document-type"
  value={outputLanguage}
  onChange={(e) => setOutputLanguage(e.target.value)}
>
  <option>Same as Input</option>
  <option>English</option>
  <option>Urdu</option>
  <option>Arabic</option>
  <option>Spanish</option>
  <option>French</option>
  <option>German</option>
  <option>Chinese</option>
  <option>Hindi</option>
  <option>Other</option>
</select>

      <br />
      <br />

      <button
        className="upload-button"
        onClick={uploadFile}
        disabled={Loading}
      >
        {Loading ? "⏳ Analyzing..." : "📄 Upload Document"}
      </button>
    </>
  );
}

export default UploadCard;