import React from "react";
import { apiMarkRead } from "../services/documents";

export default function DocumentList({ documents = [], onSelect, onMarkedRead }) {
  if (!documents.length)
    return (
      <div className="p-4 bg-white rounded shadow text-gray-500 text-center">
        Tidak ada dokumen untuk ditampilkan.
      </div>
    );

  const handleSelect = async (doc) => {
    // Jika belum dibaca → tandai sebagai read
    if (!doc.is_read) {
      try {
        await apiMarkRead(doc.id);

        // Update UI lokal agar langsung berubah
        if (onMarkedRead) {
          onMarkedRead(doc.id);
        }
      } catch (err) {
        console.error("Gagal mark as read:", err);
      }
    }

    // Kirim document ke parent
    onSelect(doc);
  };

  return (
    <div className="bg-white rounded shadow overflow-y-auto max-h-[80vh] divide-y">
      {documents.map((doc) => (
        <div
          key={doc.id}
          onClick={() => handleSelect(doc)}
          className={`p-4 cursor-pointer transition-colors ${
            !doc.is_read ? "bg-blue-50" : "hover:bg-gray-50"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {!doc.is_read && (
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
              )}
              <h3 className="font-semibold text-gray-800">{doc.title}</h3>
            </div>

            <span
              className={`text-xs px-2 py-1 rounded ${
                doc.status === "Disetujui"
                  ? "bg-green-100 text-green-700"
                  : doc.status === "Ditolak"
                  ? "bg-red-100 text-red-700"
                  : doc.status === "Revisi"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {doc.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            <strong>No Surat:</strong> {doc.no_surat}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Creator:</strong> {doc.creator || "-"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {doc.created_at ? `Created at: ${doc.created_at}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
