import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function DocumentComposer({ onSend }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [participants, setParticipants] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => setFiles(acceptedFiles),
  });

  const handleSend = () => {
    if (!title) return alert("Title is required");
    onSend({ title, message, participants, recipients, files });
    setTitle("");
    setMessage("");
    setParticipants([]);
    setRecipients([]);
    setFiles([]);
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* Drag & Drop */}
      <div {...getRootProps()} className="border-2 border-dashed p-6 text-center rounded cursor-pointer">
        <input {...getInputProps()} />
        {files.length > 0 ? (
          <ul>
            {files.map(file => (
              <li key={file.path}>{file.path} - {file.size} bytes</li>
            ))}
          </ul>
        ) : (
          <p>Drag & drop files here, or click to select files</p>
        )}
      </div>

      {/* Participants */}
      <input
        type="text"
        placeholder="Participants (comma separated)"
        value={participants.join(", ")}
        onChange={(e) => setParticipants(e.target.value.split(",").map(p => p.trim()))}
        className="border p-2 w-full rounded"
      />

      {/* Recipients */}
      <input
        type="text"
        placeholder="Recipients (comma separated)"
        value={recipients.join(", ")}
        onChange={(e) => setRecipients(e.target.value.split(",").map(r => r.trim()))}
        className="border p-2 w-full rounded"
      />

      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}
