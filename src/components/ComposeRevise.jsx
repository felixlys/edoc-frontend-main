import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useDropzone } from "react-dropzone";

import api from "../services/api";

export default function ComposeRevise() {
   const { id } = useParams();
   const navigate = useNavigate();

   const [nomorSurat, setNomorSurat] = useState("");
   const [title, setTitle] = useState("");
   const [content, setContent] = useState("");
   const [files, setFiles] = useState([]);

   const [users, setUsers] = useState([]);
   const [selectedApprovers, setSelectedApprovers] = useState([]);
   const [selectedRecipients, setSelectedRecipients] = useState([]);

   const [loading, setLoading] = useState(true);
   const [docInfo, setDocInfo] = useState(null);

   // ✅ TIPTAP Editor
   const editor = useEditor({
      extensions: [StarterKit, Underline, Link],
      content: "",
      onUpdate: ({ editor }) => setContent(editor.getHTML())
   });

   // ✅ Load Users
   const loadUsers = async () => {
      try {
         const res = await api.get("/users/users");
         setUsers(res.data || []);
      } catch (err) {
         console.error("Gagal load users:", err);
      }
   };

   // ✅ Load Document Existing Data
   const loadDocument = async () => {
      try {
         const res = await api.get(`/files/documents/${id}`);
         const doc = res.data;

         setDocInfo(doc);

         setNomorSurat(doc.no_surat);
         setTitle(doc.title);
         setContent(doc.content);
         editor?.commands.setContent(doc.content);

         // APPROVER & RECIPIENT
         setSelectedApprovers(doc.approvers?.map(a => a.user?.name || a.user) || []);
         setSelectedRecipients(doc.recipients || []);

      } catch (err) {
         alert("Gagal memuat dokumen");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadUsers();
      loadDocument();
   }, []);

   // ✅ Dropzone for new file
   const { getRootProps, getInputProps } = useDropzone({
      onDrop: (acceptedFiles) => setFiles(acceptedFiles)
   });

   if (!editor || loading) return <p className="p-4">Loading...</p>;

   // ✅ Handle Submit Revision
   const handleSubmitRevision = async () => {
      if (!nomorSurat || !title || !content) {
         alert("Semua field wajib diisi!");
         return;
      }

      try {
         // Update metadata
         await api.put(`/documents/${id}/edit`, {
            no_surat: nomorSurat,
            title,
            content,
            approvers: selectedApprovers,
            recipients: selectedRecipients
         });

         // Upload File Baru (replace)
         for (const f of files) {
            const form = new FormData();
            form.append("file", f);

            await api.put(`/documents/${id}/revise/upload`, form, {
               headers: { "Content-Type": "multipart/form-data" }
            });
         }

         alert("✅ Revisi berhasil disimpan & dikirim!");
         navigate("/sent");

      } catch (err) {
         console.error(err);
         alert("Gagal menyimpan revisi");
      }
   };

   return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">

         <h2 className="text-2xl font-bold mb-4">Revisi Dokumen</h2>

         {/* OLD DOC INFO */}
         {docInfo && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
               <p><strong>Dokumen:</strong> {docInfo.title}</p>
               <p><strong>Status:</strong> {docInfo.status}</p>
               <p className="text-yellow-700 font-semibold">
                  Catatan Revisi:{" "}
                  {docInfo.approvers.find(a => a.status === "revise")?.catatan || "Tidak ada catatan"}
               </p>
            </div>
         )}

         {/* Nomor Surat */}
         <input
            type="text"
            value={nomorSurat}
            onChange={e => setNomorSurat(e.target.value)}
            className="w-full border p-2 rounded mb-4"
            placeholder="Nomor Surat"
         />

         {/* Judul */}
         <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border p-2 rounded mb-4"
            placeholder="Judul Dokumen"
         />

         {/* Approver */}
         <label className="font-semibold">Approver</label>
         <select
            multiple
            value={selectedApprovers}
            onChange={(e) =>
               setSelectedApprovers(
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
               )
            }
            className="w-full border p-2 rounded h-32 mb-4"
         >
            {users.map((u) => (
               <option key={u.id} value={u.name}>
                  {u.name}
               </option>
            ))}
         </select>

         {/* Recipient */}
         <label className="font-semibold">Recipient</label>
         <select
            multiple
            value={selectedRecipients}
            onChange={(e) =>
               setSelectedRecipients(
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
               )
            }
            className="w-full border p-2 rounded h-32 mb-4"
         >
            {users.map((u) => (
               <option key={u.id} value={u.name}>
                  {u.name}
               </option>
            ))}
         </select>

         {/* Content */}
         <label className="font-semibold">Isi Dokumen</label>
         <div className="border rounded mb-4">
            <EditorContent editor={editor} className="min-h-[250px] p-2" />
         </div>

         {/* Upload File Baru */}
         <div {...getRootProps()} className="border-dashed border-2 p-4 rounded mb-4 cursor-pointer">
            <input {...getInputProps()} />
            <p className="text-gray-600">Klik atau drop file baru untuk upload ulang</p>

            {files.length > 0 && (
               <ul className="mt-2 text-sm">
                  {files.map((f, i) => (
                     <li key={i}>📄 {f.name}</li>
                  ))}
               </ul>
            )}
         </div>

         <button
            onClick={handleSubmitRevision}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
         >
            ✅ Kirim Revisi
         </button>
      </div>
   );
}
