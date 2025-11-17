import React, { useEffect, useState, useContext } from "react";
import { getTrash } from "../services/documents";
import { AuthContext } from "../context/AuthContext";

export default function Trash() {
  const { token } = useContext(AuthContext);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const data = await getTrash();
        setDocs(data);
      } catch (err) {
        console.error("Gagal ambil trash:", err);
      }
    };
    if (token) fetchTrash();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">🗑️ Trash</h1>
      {docs.length === 0 ? (
        <p className="text-gray-500">Tidak ada dokumen di trash.</p>
      ) : (
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">Nama File</th>
              <th className="p-2 border">Document ID</th>
              <th className="p-2 border">Tanggal Hapus</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="p-2 border">{d.filename}</td>
                <td className="p-2 border">{d.document_id}</td>
                <td className="p-2 border">{d.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>

      )}
    </div>
  );
}
