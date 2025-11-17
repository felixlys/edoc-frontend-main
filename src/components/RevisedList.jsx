import React, { useEffect, useState } from "react";
import {
  apiGetDocumentDetail,
  apiGetReasons,
  apiEditDocument,
  apiUploadRevisedFile,
  getDashboard,
} from "../services/documents";

export default function RevisedList() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoadingList(true);
      try {
        const res = await getDashboard();
        const revisiDocs = (res.inbox || []).filter((doc) => doc.status === "Revisi");
        setDocuments(revisiDocs);
      } catch (err) {
        console.error(err);
        setDocuments([]);
      }
      setLoadingList(false);
    };
    fetchDocs();
  }, []);

  if (loadingList) return <p className="p-4">Loading daftar dokumen...</p>;
  if (documents.length === 0) return <p className="p-4">Tidak ada dokumen untuk direvisi</p>;

  return (
    <div className="flex h-full">
      {/* List Dokumen */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="p-4 font-bold text-lg bg-gray-100 border-b">
          Dokumen Revisi
        </h2>
        <ul>
          {documents.map((doc) => (
            <li
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                selectedDocId === doc.id ? "bg-blue-50" : ""
              }`}
            >
              <p className="font-medium">{doc.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(doc.updated_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail / Revisi Dokumen */}
      <div className="flex-1 p-4 overflow-auto">
        {selectedDocId ? <ReviseDocument docId={selectedDocId} /> : <p className="text-gray-400">Klik dokumen untuk mulai revisi</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviseDocument component
// ---------------------------------------------------------------------------
function ReviseDocument({ docId }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noSurat, setNoSurat] = useState("");
  const [file, setFile] = useState(null);
  const [reasons, setReasons] = useState([]);

  useEffect(() => {
    if (!docId) return;

    const fetchDoc = async () => {
      setLoading(true);
      try {
        const res = await apiGetDocumentDetail(docId);
        setDoc(res);
        setTitle(res.title);
        setContent(res.content);
        setNoSurat(res.no_surat);

        const r = await apiGetReasons(docId);
        setReasons(r.reasons || []);
      } catch (err) {
        console.error(err);
        setDoc(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [docId]);

  const handleEditSubmit = async () => {
    if (!title || !content || !noSurat) return alert("Semua field harus diisi");

    try {
      await apiEditDocument(docId, { title, content, no_surat: noSurat });
      alert("Dokumen berhasil direvisi dan dikembalikan ke waiting approval.");
    } catch (err) {
      console.error(err);
      alert("Gagal merevisi dokumen");
    }
  };

  const handleFileUpload = async () => {
    if (!file) return alert("Pilih file revisi");
    try {
        await apiUploadRevisedFile(docId, file);
        alert("File revisi berhasil diupload");
        setFile(null);
    } 
    catch (err) {
        console.error(err);
        alert("Gagal upload file");
    }
  };

  if (loading) return <p className="p-4">Loading detail dokumen...</p>;
  if (!doc) return <p className="p-4">Dokumen tidak ditemukan</p>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Revisi Dokumen</h2>

      {/* Metadata */}
      <div className="space-y-2">
        <label className="block font-medium">No. Surat</label>
        <input type="text" value={noSurat} onChange={(e) => setNoSurat(e.target.value)} className="border p-2 w-full" />

        <label className="block font-medium">Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 w-full" />

        <label className="block font-medium">Content</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="border p-2 w-full h-32" />
      </div>

      {/* Upload file revisi */}
      <div className="space-y-2">
        <label className="block font-medium">Upload File Revisi</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleFileUpload} className="bg-blue-600 text-white px-4 py-2 rounded">
          Upload File
        </button>
      </div>

      <button onClick={handleEditSubmit} className="bg-green-600 text-white px-6 py-2 rounded mt-2">
        Submit Revisi
      </button>

      {/* Catatan / alasan revisi */}
      <div className="mt-6">
        <h3 className="font-bold mb-2">Catatan dari Approver</h3>
        {reasons.length === 0 ? (
          <p className="text-gray-500">Tidak ada catatan</p>
        ) : (
          <ul className="space-y-1">
            {reasons.map((r) => (
              <li key={r.user_id} className="text-sm text-gray-700">
                <strong>
                  {r.name} ({r.status}):
                </strong>{" "}
                {r.catatan} <em>{r.waktu}</em>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
