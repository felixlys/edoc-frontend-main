import React, { useEffect, useState } from "react";
import {
  getWaitingApproval,
  apiApprove,
  apiReject,
  apiRevise,
} from "../services/documents";
import DocumentDetail from "../components/DocumentDetail";

export default function WaitingMyApproval() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ============================
  // FETCH DATA
  // ============================
  useEffect(() => {
    async function fetchWaiting() {
      try {
        const data = await getWaitingApproval();

        const normalized = (data || [])
          .map((d) => ({
            ...d,
            approvers: (d.approvers || []).map((a) => a.name).join(", "),
            recipients: (d.recipients || []).map((r) => r.name).join(", "),
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // ⬅ terbaru dulu

        setDocuments(normalized);
      } catch (error) {
        console.error("Gagal memuat dokumen menunggu persetujuan:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWaiting();
  }, []);

  // ============================
  // HANDLERS
  // ============================
  const handleApprove = async (id) => {
    if (!window.confirm("Setujui dokumen ini?")) return;

    try {
      await apiApprove(id);
      alert("✅ Dokumen disetujui!");
      setDocuments((docs) => docs.filter((d) => d.id !== id));
      setSelectedDoc(null);
    } catch (err) {
      alert("Gagal menyetujui dokumen");
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (!reason) return;

    try {
      await apiReject(id, reason);
      alert("🚫 Dokumen ditolak!");
      setDocuments((docs) => docs.filter((d) => d.id !== id));
      setSelectedDoc(null);
    } catch (err) {
      alert("Gagal menolak dokumen");
      console.error(err);
    }
  };

  const handleRevise = async (id) => {
    const reason = prompt("Masukkan alasan revisi:");
    if (!reason) return;

    try {
      await apiRevise(id, reason);
      alert("✏️ Dokumen dikembalikan untuk revisi!");
      setDocuments((docs) => docs.filter((d) => d.id !== id));
      setSelectedDoc(null);
    } catch (err) {
      alert("Gagal merevisi dokumen");
      console.error(err);
    }
  };

  // ============================
  // FILTER BY SEARCH
  // ============================
  const filteredDocs = documents.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(search.toLowerCase()) ||
      doc.no_surat?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Memuat data...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Waiting My Approval</h2>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="🔍 Cari dokumen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      {/* LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[85vh]">
        
        {/* LEFT LIST */}
        <div className="lg:col-span-1 overflow-y-auto">
          {filteredDocs.length ? (
            <div className="space-y-2">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded border shadow-sm transition ${
                    selectedDoc?.id === doc.id
                      ? "bg-blue-50 border-blue-400"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div
                    onClick={() => setSelectedDoc(doc)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">
                        {doc.title}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      <strong>No Surat:</strong> {doc.no_surat}
                    </p>

                    {/* Tanggal Created */}
                    <p className="text-xs text-gray-500">
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Tanggal tidak tersedia"}
                    </p>

                    <p className="text-xs text-gray-500">{doc.status}</p>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(doc.id)}
                      className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(doc.id)}
                      className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => handleRevise(doc.id)}
                      className="flex-1 px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                    >
                      Revise
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-gray-500 bg-white rounded shadow">
              Tidak ada dokumen menunggu persetujuan.
            </div>
          )}
        </div>

        {/* RIGHT DETAIL */}
        <div className="lg:col-span-3 overflow-y-auto bg-white p-6 rounded-lg shadow h-full">
          {selectedDoc ? (
            <DocumentDetail
              doc={selectedDoc}
              onUpdate={setSelectedDoc}
              allowActions={true}
              onApprove={() => handleApprove(selectedDoc.id)}
              onReject={() => handleReject(selectedDoc.id)}
              onRevise={() => handleRevise(selectedDoc.id)}
            />
          ) : (
            <p className="text-gray-500">Pilih dokumen untuk melihat detail</p>
          )}
        </div>
      </div>
    </div>
  );
}
