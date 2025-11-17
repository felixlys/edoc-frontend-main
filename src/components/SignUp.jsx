import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 📦 Gunakan FormData agar bisa kirim file dan text sekaligus
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone_number", phoneNumber);
      if (avatar) formData.append("avatar", avatar);

      await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Pendaftaran berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      alert(
        err.response?.data?.detail ||
          "Gagal mendaftar. Periksa kembali data Anda."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-4">
          Buat Akun Baru
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Daftar untuk mulai menggunakan sistem e-dokumen
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <input
            type="email"
            placeholder="Alamat email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <input
            type="password"
            placeholder="Kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <input
            type="text"
            placeholder="Nomor WhatsApp / HP"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <div>
            <label className="text-gray-600 text-sm mb-1 block">
              Foto Profil (opsional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Daftar
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-green-600 font-semibold">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
