import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  apiApprove,
  apiReject,
  apiRevise,
  apiDownloadFile,
  apiDownloadStamped,
  apiGetReasons,
} from "../services/documents";
import { useNavigate } from "react-router-dom";

// ============================
// ✅ Badge warna status
// ============================
const getBadgeClass = (status) => {
  if (!status) {
    return "bg-gray-400 text-white px-3 py-1 rounded-full text-[11px] font-semibold";
  }

  const s = status.toLowerCase();
  const base = "px-3 py-1 rounded-full text-[11px] font-semibold text-white";

  if (s.includes("disetujui") || s.includes("approved")) return `${base} bg-blue-800`;
  if (s.includes("revisi") || s.includes("revise")) return `${base} bg-yellow-500`;
  if (s.includes("tolak") || s.includes("reject")) return `${base} bg-red-700`;
  if (
    s.includes("menunggu") ||
    s.includes("waiting") ||
    s.includes("persetujuan") ||
    s.includes("pending") ||
    s.includes("review")
  )
    return `${base} bg-orange-500`;

  return `${base} bg-gray-400`;
};

// ============================
// ✅ Download helper
// ============================
const downloadBlob = (data, filename, type) => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ============================
// ✅ Component Utama
// ============================
export default function DocumentDetail({ doc, onUpdate, activeTab }) {
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(doc?.title || "");
  const [editNoSurat, setEditNoSurat] = useState(doc?.no_surat || "");
  const [editContent, setEditContent] = useState(doc?.content || "");
  const [reasons, setReasons] = useState([]); // ✅ state untuk reasons
  const navigate = useNavigate();

  useEffect(() => {
    setEditTitle(doc?.title || "");
    setEditNoSurat(doc?.no_surat || "");
    setEditContent(doc?.content || "");

    if (!doc) return;

    // ✅ ambil reasons dari backend
    const fetchReasons = async () => {
      try {
        const res = await apiGetReasons(doc.id);
        setReasons(res.data.reasons || []);
      } catch (err) {
        console.error("Gagal mengambil reasons:", err);
        setReasons([]);
      }
    };

    fetchReasons();
  }, [doc]);

  if (!doc) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded shadow">
        Pilih dokumen untuk melihat detail
      </div>
    );
  }

  // ============================
  // ✅ Data User & State Umum
  // ============================
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {}

  const isWaiting = activeTab === "ready_to_approve";
  const isInbox = activeTab === "inbox";
  const approvers = Array.isArray(doc.approvers) ? doc.approvers : [];
  const originalFiles = doc.files?.filter((f) => !f.is_stamped) || [];
  const stampedFiles = doc.files?.filter((f) => f.is_stamped) || [];
  const normalize = (v) =>
    (v || "").toString().trim().replace(/\s+/g, " ").toLowerCase();
  const isCreator = normalize(doc.creator) === normalize(user?.name);
  // ============================
  // ✅ DOWNLOAD HANDLERS
  // ============================
  const handleDownloadFile = async (file) => {
    const res = await apiDownloadFile(doc.id, file.id);
    downloadBlob(res.data, file.filename, res.headers["content-type"]);
  };

  const handleDownloadStamped = async () => {
    const res = await apiDownloadStamped(doc.id);
    downloadBlob(res.data, `stamped_${doc.title}.pdf`, "application/pdf");
  };

  // ============================
  // ✅ APPROVAL HANDLERS
  // ============================
  const handleApprove = async () => {
    if (!window.confirm("Setujui dokumen ini?")) return;
    await apiApprove(doc.id);
    onUpdate({ ...doc, status: "approved" });
  };

  const handleReject = async () => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (!reason) return alert("Alasan wajib diisi.");
    try {
      await apiReject(doc.id, reason);
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const updatedApprovers = [...(doc.approvers || [])];

      const rejectIndex = updatedApprovers.findIndex(
        (a) =>
          a.user?.id === user.id ||
          a.user_id === user.id ||
          a.user?.name === user.name
      );

      if (rejectIndex !== -1) {
        updatedApprovers[rejectIndex] = {
          ...updatedApprovers[rejectIndex],
          status: "rejected",
          catatan: reason,
          waktu: new Date().toLocaleString("id-ID"),
        };
      }

      for (let i = rejectIndex + 1; i < updatedApprovers.length; i++) {
        updatedApprovers[i] = {
          ...updatedApprovers[i],
          status: "rejected (auto)",
          catatan: "",
          waktu: new Date().toLocaleString("id-ID"),
        };
      }

      const updatedDoc = {
        ...doc,
        status: "rejected",
        approvers: updatedApprovers,
        reason,
        rejected_by: user?.name || "Unknown",
        rejected_at: new Date().toISOString(),
      };

      onUpdate(updatedDoc);
      alert("🚫 Dokumen ditolak! Approver berikutnya otomatis ditolak juga.");
    } catch (err) {
      console.error(err);
      alert("Gagal menolak dokumen");
    }
  };

  // ============================
  // ✅ REVISE HANDLER
  // ============================
  const handleRevise = async () => {
    const reason = prompt("Masukkan alasan revisi:");
    if (!reason) return alert("Alasan wajib diisi.");
    await apiRevise(doc.id, reason);
    onUpdate({ ...doc, status: "revisi" });
  };

  // ============================
  // ✅ EDIT HANDLER
  // ============================
  const handleSaveEdit = async () => {
    try {
      await api.put(`/documents/${doc.id}/edit`, {
        title: editTitle,
        content: editContent,
        no_surat: editNoSurat,
      });

      setEditMode(false);
      onUpdate({
        ...doc,
        title: editTitle,
        content: editContent,
        no_surat: editNoSurat,
        status: "waiting",
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Gagal menyimpan revisi");
    }
  };

  // ============================
  // ✅ UPLOAD FILE BARU
  // ============================
  const handleUploadNewFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      await api.put(`/documents/${doc.id}/revise/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File berhasil diupload ulang");
    } catch (err) {
      alert("Gagal upload ulang file");
    }
  };

  // ============================
  // ✅ SET REVISE MANUAL
  // ============================
  const handleSetRevise = async () => {
    const reason = prompt("Alasan revisi (opsional):");
    try {
      await api.put(`/documents/${doc.id}/set-revise`, { reason });
      alert("Dokumen ditandai sebagai revisi. Tombol Edit muncul!");
      onUpdate({ ...doc, status: "revisi" });
    } catch (err) {
      console.error(err);
      alert("Gagal menandai dokumen sebagai revisi");
    }
  };

  // ============================
  // ✅ RENDER UI
  // ============================
  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      {/* HEADER */}
      <div>
        {editMode ? (
          <>
            <input
              className="border p-2 w-full text-xl font-semibold mb-2"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <input
              className="border p-2 w-full mb-2"
              value={editNoSurat}
              onChange={(e) => setEditNoSurat(e.target.value)}
            />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              {doc.title}
            </h2>
            <p className="text-sm text-gray-500">No Surat: {doc.no_surat}</p>
          </>
        )}

        <p className="text-sm text-gray-500 flex items-center gap-2">
          Status: <span className={getBadgeClass(doc.status)}>{doc.status}</span>
        </p>
        <p className="text-sm text-gray-500">Creator: {doc.creator}</p>
        <p className="text-sm text-gray-500">
          Dibuat pada:{" "}
          {doc.created_at ? new Date(doc.created_at).toLocaleString("id-ID") : "-"}
        </p>
      </div>

      {/* CONTENT */}
      <div className="border-t pt-4">
        {editMode ? (
          <textarea
            className="w-full border p-3 rounded h-40"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
        ) : (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        )}
      </div>

      {/* APPROVERS */}
      <div>
        <h3 className="font-semibold mb-2">Daftar Approver</h3>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="text-gray-600 font-medium">
              <th>Nama</th>
              <th>Status</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {approvers.map((a) => (
              <tr key={`${a.user?.name || a.user}-${a.seq_index || 0}-${a.status}`}
              className="border-t">
                <td>{a.user?.name || a.user}</td>
                <td>
                  <span className={getBadgeClass(a.status)}>{a.status}</span>
                </td>
                <td>{a.waktu || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RECIPIENT */}
      <div className="mt-3">
        <h3 className="text-base font-semibold text-gray-800 mb-2">
          Recipient / CC:
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {Array.isArray(doc.recipients) && doc.recipients.length > 0 ? (
            doc.recipients.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-xs"
              >
                <span className="font-medium">{name}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-sm">
              Tidak ada penerima terdaftar.
            </p>
          )}
        </div>
      </div>

      {/* ATTACHMENTS */}
      <div>
        <h3 className="font-semibold">Attachments</h3>
        <ul className="list-disc ml-6">
          {originalFiles.map((f) => (
            <li key={f.id}>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => handleDownloadFile(f)}
              >
                {f.filename}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* STAMPED PDF */}
      {isInbox && stampedFiles.length > 0 && (
        <div>
          <h3 className="font-semibold">Stamped PDF</h3>
          <button
            className="text-blue-600 underline"
            onClick={handleDownloadStamped}
          >
            Download Stamped PDF
          </button>
        </div>
      )}

      {/* REASONS */}
      {reasons.length > 0 && (
         <div
            className={
               reasons[0].status?.toLowerCase().includes("revise")
                  ? "p-3 bg-yellow-50 border border-yellow-300 rounded"
                  : "p-3 bg-red-50 border border-red-200 rounded"
            }
         >
            <p className="font-semibold">Catatan / Alasan:</p>

            {reasons.map((r, idx) => {
               const isRevise = r.status?.toLowerCase().includes("revise");
               const isReject = r.status?.toLowerCase().includes("reject");

               return (
                  <p
                     key={idx}
                     className={
                        isRevise
                           ? "text-yellow-700 text-sm"
                           : isReject
                           ? "text-red-600 text-sm"
                           : "text-gray-600 text-sm"
                     }
                  >
                     <strong>{r.name}</strong> ({r.status}):{" "}
                     {r.catatan || "Tidak ada catatan"}
                     {r.waktu
                        ? ` - ${new Date(r.waktu).toLocaleString("id-ID")}`
                        : ""}
                  </p>
               );
            })}
         </div>
      )}

      {/* EDIT SECTION */}
      {isCreator &&
         normalize(doc.status).includes("Revisi") && (
            <div className="flex gap-3">
               <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                  onClick={() => navigate(`/revise/${doc.id}`)}
               >
                  ✏️ Edit Dokumen (Revisi)
               </button>
            </div>
      )}

      {/* APPROVAL BUTTONS */}
      {isWaiting && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleApprove}
          >
            Approve
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleReject}
          >
            Reject
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            onClick={handleRevise}
          >
            Revise
          </button>
        </div>
      )}
    </div>
  );
}
