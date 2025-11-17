import React, { useEffect, useState, useContext } from "react";
import { getDashboard, deleteInbox } from "../services/documents";
import api from "../services/api";
import DocumentDetail from "../components/DocumentDetail";
import { UnreadContext } from "../components/UnreadContext";

export default function Inbox() {
  const [documents, setDocuments] = useState([]);

  // 🆕 Search box
  const [search, setSearch] = useState("");

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const { decrementInbox, refreshUnread } = useContext(UnreadContext);

  // 🆕 Format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("id-ID") +
      " " +
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    );
  };

  useEffect(() => {
    async function fetchInbox() {
      try {
        const data = await getDashboard();

        // 🆕 Urutkan dari terbaru → terlama
        const sorted = (data.inbox || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setDocuments(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        refreshUnread();
      }
    }
    fetchInbox();
  }, []);

  const markAsRead = async (doc) => {
    if (doc.is_read) return;

    try {
      await api.patch(`/files/documents/${doc.id}/read`);

      setDocuments((prevDocs) =>
        prevDocs.map((d) =>
          d.id === doc.id ? { ...d, is_read: true } : d
        )
      );

      if (selectedDoc?.id === doc.id)
        setSelectedDoc((prev) => ({ ...prev, is_read: true }));

      decrementInbox();
    } catch (err) {
      console.error("Gagal mark as read:", err);
    }
  };

  const handleSelect = async (doc) => {
    setSelectedDoc(doc);
    await markAsRead(doc);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus dokumen?")) return;

    try {
      await deleteInbox(id);

      setDocuments((docs) => docs.filter((d) => d.id !== id));

      if (selectedDoc?.id === id) setSelectedDoc(null);

      refreshUnread();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Memuat data...</p>;

  // 🆕 Filter search
  const filteredDocs = documents.filter((doc) => {
    const s = search.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(s) ||
      doc.no_surat?.toLowerCase().includes(s) ||
      doc.status?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Inbox</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[85vh]">

        {/* LIST INBOX */}
        <div className="lg:col-span-1 overflow-y-auto">

          {/* 🆕 SEARCH BOX */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Cari pesan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
            />
          </div>

          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleSelect(doc)}
                className={`p-3 rounded border shadow-sm cursor-pointer transition relative
                  ${
                    selectedDoc?.id === doc.id
                      ? "bg-blue-50 border-blue-400"
                      : doc.is_read
                      ? "bg-white hover:bg-gray-50"
                      : "bg-blue-100"
                  }`}
              >
                {!doc.is_read && (
                  <span className="absolute left-2 top-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">
                    {doc.title}
                  </span>
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

                {/* 🆕 TANGGAL CREATED */}
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(doc.created_at)}
                </p>

                <p className="text-xs text-gray-500">{doc.status}</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500 bg-white rounded shadow">
              Tidak ada dokumen
            </div>
          )}
        </div>

        {/* DETAIL */}
        <div className="lg:col-span-3 overflow-y-auto bg-white p-6 rounded-lg shadow h-full">
          {selectedDoc ? (
            <DocumentDetail
              doc={selectedDoc}
              onUpdate={setSelectedDoc}
              activeTab="inbox"
            />
          ) : (
            <p className="text-gray-500">
              Pilih dokumen untuk melihat detail.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
