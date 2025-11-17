import React from "react";

export default function DocumentItem({ doc, onSelect }) {
  return (
    <div
      className="p-4 bg-white rounded shadow hover:bg-gray-50 cursor-pointer"
      onClick={() => onSelect(doc)}
    >
      <h3 className="font-semibold">{doc.title}</h3>
      <p className="text-sm text-gray-500">No Surat: {doc.no_surat}</p>
      <p className="text-sm text-gray-500">Creator: {doc.creator}</p>
      <p className="text-sm text-gray-500">Status: {doc.status}</p>
    </div>
  );
}

