import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useDropzone } from "react-dropzone";
import api from "../services/api";

export default function ComposeRevise() {
  const { id } = useParams();

  const [nomorSurat, setNomorSurat] = useState("");
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [docInfo, setDocInfo] = useState(null);

  // ------------------------------------------
  // ✅ Load Existing Document (for revision)
  // ------------------------------------------
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/files/documents/${id}`);
        const doc = res.data;

        setDocInfo(doc);

        setNomorSurat(doc.no_surat);
        setTitle(doc.title);
        setContent(doc.content);
        editor?.commands.setContent(doc.content);
      } catch (error) {
        console.error("Failed to load document:", error);
        alert("Gagal memuat dokumen");
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [id]);

  // ------------------------------------------
  // ✅ Editor (Tiptap)
  // ------------------------------------------
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link],
    content: content || "",
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  // ------------------------------------------
  // ✅ File Dropzone
  // ------------------------------------------
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setFiles([...files, ...acceptedFiles]),
  });

  if (!editor || loading) return <p>Loading...</p>;

  // ------------------------------------------
  // ✅ Submit Revision
  // ------------------------------------------
  const handleSubmitRevision = async () => {
    if (!nomorSurat || !title || !content) {
      alert("Semua field wajib diisi!");
      return;
    }

    try {
      // 1️⃣ Update metadata
      await api.put(`/documents/${id}/edit`, {
        no_surat: nomorSurat,
        title,
        content,
      });

      // 2️⃣ Upload revised file (if any)
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);

        await api.put(`/documents/${id}/revise/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Dokumen berhasil direvisi & dikirim kembali!");
      window.location.href = "/sent";
    } catch (error) {
      console.error("Revision failed:", error);
      alert("Gagal mengirim revisi");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Revisi Dokumen</h2>

      {/* Informasi dokumen lama */}
      {docInfo && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
          <p><strong>Dokumen:</strong> {docInfo.title}</p>
          <p><strong>Status:</strong> {docInfo.status}</p>
          <p className="text-red-600">
            <strong>Catatan Revisi:</strong>{" "}
            {docInfo.approvers.find(a => a.status === "revise")?.catatan ||
              "Tidak ada catatan"}
          </p>
        </div>
      )}

      {/* Nomor Surat */}
      <div className="mb-4">
        <input
          type="text"
          value={nomorSurat}
          onChange={(e) => setNomorSurat(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Nomor Surat"
        />
      </div>

      {/* Title */}
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Judul Dokumen"
        />
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Isi Dokumen</label>

        <div className="border rounded">
          {/* Toolbar */}
          <div className="border-b p-2 flex gap-2 bg-gray-50">
            <button onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "font-bold text-blue-600" : ""}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "italic text-blue-600" : ""}>I</button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "underline text-blue-600" : ""}>U</button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
          </div>

          <div className="p-2 min-h-[250px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Upload File Baru */}
      <div {...getRootProps()} className="mb-4 p-4 border-dashed border-2 border-gray-400 rounded cursor-pointer">
        <input {...getInputProps()} />
        <p>Drop file baru atau klik untuk upload ulang</p>

        {files.length > 0 && (
          <ul className="mt-2 text-sm text-gray-700">
            {files.map((file, idx) => (
              <li key={idx}>📄 {file.name}</li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleSubmitRevision}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Kirim Revisi
      </button>
    </div>
  );
}
