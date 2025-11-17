import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const sendCode = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("phone_number", phoneNumber);

      const res = await api.post("/auth/forgot-password", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resetToken = res.data.reset_token; // Ambil reset_token dari backend

      alert("Kode verifikasi telah dikirim ke WhatsApp/SMS!");
      navigate("/send-otp", {
        state: { 
          formattedPhone: phoneNumber,
          mode: "reset",      // pastikan mode reset untuk flow forgot-password
          resetToken          // teruskan resetToken ke halaman SendOTP
        }
      });

    } catch (err) {
      console.error(err);

      if (err.response?.status === 404) {
        alert("Nomor telepon belum terdaftar. Silakan cek kembali.");
      } else if (err.response?.status === 429) {
        alert("OTP sudah dikirim, silakan tunggu beberapa menit.");
      } else {
        alert("Gagal mengirim kode! Pastikan nomor sudah terdaftar.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Lupa Password
        </h2>

        <form onSubmit={sendCode} className="space-y-4">
          <input
            type="tel"
            placeholder="Masukkan nomor WhatsApp (contoh: +6281234567890)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            Kirim Kode
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Sudah ingat password?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-semibold"
          >
            Kembali ke Login
          </a>
        </p>
      </div>
    </div>
  );
}
