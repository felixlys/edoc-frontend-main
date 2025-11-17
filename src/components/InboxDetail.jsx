import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentDetail } from "../services/documents";
import DocumentDetail from "../components/DocumentDetail";

export default function InboxDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getDocumentDetail(id);
      setDoc(data);
    }
    load();
  }, [id]);

  if (!doc) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => window.history.back()}
        className="mb-4 px-3 py-1 bg-gray-200 rounded"
      >
        ← Kembali
      </button>

      <DocumentDetail
        doc={doc}
        onUpdate={setDoc}
        activeTab="inbox"
      />
    </div>
  );
}
