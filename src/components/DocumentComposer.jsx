import React, { useState } from "react";

export default function DocumentComposer({ onSend }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="p-4 bg-white rounded shadow space-y-2">
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
      ></textarea>
      <div className="space-x-2">
        <button className="bg-green-500 text-white px-4 py-2 rounded">Create & Upload</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Assign Participants</button>
        <button
          onClick={() => onSend({ title, message })}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

