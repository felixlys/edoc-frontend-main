import React, { useEffect, useState } from "react";
import { getDashboard, deleteSent } from "../services/documents";
import DocumentDetail from "../components/DocumentDetail";

export default function Sent() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchSent() {
      try {
        const data = await getDashboard(); // Ambil dashboard data
        const sorted = (data.my_finalized || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setDocuments(sorted);
      } catch (error) {
        console.error("Gagal memuat Sent items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSent();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus dokumen dari Sent?")) {
      try {
        await deleteSent(id);
        setDocuments((docs) => docs.filter((d) => d.id !== id));
        if (selectedDoc?.id === id) setSelectedDoc(null);
      } catch (error) {
        alert("Tidak dapat menghapus dokumen yang sudah final (approved/rejected).");
        console.error(error);
      }
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
      <h2 className="text-2xl font-bold">Sent Items</h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="🔍 Cari dokumen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT LIST */}
        <div className="lg:col-span-1 overflow-y-auto">
          {filteredDocs.length ? (
            <div className="space-y-2">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded shadow-sm border cursor-pointer transition ${
                    selectedDoc?.id === doc.id
                      ? "bg-blue-50 border-blue-400"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{doc.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>No Surat:</strong> {doc.no_surat}
                  </p>
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
                  <p
                    className={`text-xs font-semibold ${
                      doc.status === "Disetujui"
                        ? "text-green-600"
                        : doc.status === "Ditolak"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {doc.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-gray-500 bg-white rounded shadow">
              Belum ada dokumen yang Anda kirim.
            </div>
          )}
        </div>

        {/* RIGHT DETAIL */}
        <div className="lg:col-span-2">
          <DocumentDetail doc={selectedDoc} onUpdate={setSelectedDoc} />
        </div>
      </div>
    </div>
  );
}
