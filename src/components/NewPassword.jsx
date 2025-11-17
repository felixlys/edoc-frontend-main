import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const phone = location.state?.phone || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) return alert("Semua field wajib diisi.");
    if (password !== confirm) return alert("Konfirmasi password tidak cocok.");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("phone_number", phone);
      formData.append("new_password", password);

      await api.post("/auth/reset-password", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Password berhasil diubah!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Gagal memperbarui password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Buat Password Baru
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Password Baru"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
          <input
            type="password"
            placeholder="Konfirmasi Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}
