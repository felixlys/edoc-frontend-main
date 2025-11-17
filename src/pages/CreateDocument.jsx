import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { useDropzone } from "react-dropzone";
import Select from "react-select";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function CreateDocument() {
  const [nomorSurat, setNomorSurat] = useState("");
  const [title, setTitle] = useState("");
  const [approvers, setApprovers] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [files, setFiles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [content, setContent] = useState("");
  const [font, setFont] = useState("Arial, sans-serif");
  const [fontSize, setFontSize] = useState("16px");
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const editor = useEditor({
    extensions: [StarterKit, Underline, Link, TextStyle, FontFamily],
    content: content || "",
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/users");
        const options = res.data.map((u) => ({
          value: u.id,
          label: `${u.name} (${u.email})`,
        }));
        setAllUsers(options);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (accepted) => setFiles((prev) => [...prev, ...accepted]),
  });

  const handleRemoveFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSend = async () => {
    if (!nomorSurat || !title || !content) {
      alert("Nomor Surat, Judul, dan Isi wajib diisi!");
      return;
    }

    try {
      const res = await api.post("/documents/", {
        no_surat: nomorSurat,
        title,
        content,
      });
      const docId = res.data.doc_id;

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await api.post(`/documents/${docId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await api.post(`/documents/${docId}/assign`, {
        approver_ids: approvers.map((a) => a.value),
        recipient_ids: recipients.map((r) => r.value),
      });

      alert("Dokumen berhasil dikirim!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim dokumen");
    }
  };

  if (!editor) return null;

  const handleFontChange = (f) => {
    setFont(f);
    editor.chain().focus().setMark("textStyle", { fontFamily: f }).run();
  };

  const handleFontSizeChange = (s) => {
    setFontSize(s);
    editor.chain().focus().setMark("textStyle", { fontSize: s }).run();
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 sm:mt-8 bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-20 relative">
      <h2 className="text-lg sm:text-2xl font-bold mb-4 text-center sm:text-left">
        {isEditMode ? "Edit Document" : "Compose Document"}
      </h2>

      {/* Nomor Surat */}
      <input
        type="text"
        placeholder="Nomor Surat"
        value={nomorSurat}
        onChange={(e) => setNomorSurat(e.target.value)}
        className="w-full mb-3 p-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
      />

      {/* Title */}
      <input
        type="text"
        placeholder="Judul Dokumen"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-3 p-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
      />

      {/* Approvers & Recipients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
        <div>
          <label className="block text-sm font-semibold mb-1">Approvers</label>
          <Select
            isMulti
            options={allUsers}
            value={approvers}
            onChange={setApprovers}
            placeholder="Pilih approvers..."
            className="text-sm z-50"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Recipients</label>
          <Select
            isMulti
            options={allUsers}
            value={recipients}
            onChange={setRecipients}
            placeholder="Pilih recipients..."
            className="text-sm z-50"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        </div>
      </div>

      {/* Editor */}
      <div className="mt-5 border rounded-lg overflow-hidden relative z-10">
        <div className="p-2 flex flex-wrap gap-2 bg-gray-50 border-b items-center justify-center sm:justify-start sticky top-0 z-10">
          {/* Font controls */}
          <select
            value={font}
            onChange={(e) => handleFontChange(e.target.value)}
            className="border rounded px-2 py-1 text-xs sm:text-sm"
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="Calibri, sans-serif">Calibri</option>
            <option value="'Poppins', sans-serif">Poppins</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Georgia', serif">Georgia</option>
          </select>
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="border rounded px-2 py-1 text-xs sm:text-sm"
          >
            {[12, 14, 16, 18, 20, 24].map((s) => (
              <option key={s} value={`${s}px`}>
                {s}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="font-bold px-2"
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="italic px-2"
            >
              I
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className="underline px-2"
            >
              U
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="px-2"
            >
              •
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="px-2"
            >
              1.
            </button>
            <button
              onClick={() => editor.chain().focus().undo().run()}
              className="px-2"
            >
              ↺
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              className="px-2"
            >
              ↻
            </button>
          </div>
        </div>

        <div className="p-2 min-h-[250px] sm:min-h-[300px] relative z-0">
          <EditorContent
            editor={editor}
            style={{ fontFamily: font, fontSize }}
            className="prose max-w-none focus:outline-none"
          />
        </div>
      </div>

      {/* Upload */}
      <div
        {...getRootProps()}
        className="mt-5 border-2 border-dashed border-gray-400 rounded-lg p-4 text-center text-gray-600 hover:bg-gray-50 cursor-pointer relative z-10"
      >
        <input {...getInputProps()} />
        <p>📎 Ketuk atau seret file ke sini</p>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex justify-between bg-gray-100 p-2 rounded"
              >
                <span className="truncate">{f.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(i);
                  }}
                  className="text-red-500 hover:text-red-700 font-bold text-sm"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-3 flex gap-3 px-4 sm:static sm:justify-end sm:mt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 sm:flex-none bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg"
        >
          Batal
        </button>
        <button
          onClick={handleSend}
          className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg"
        >
          {isEditMode ? "Simpan" : "Kirim"}
        </button>
      </div>
    </div>
  );
}
