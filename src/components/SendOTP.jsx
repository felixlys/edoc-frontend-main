import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function SendOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  // 📌 Ambil data dari halaman sebelumnya
  const phone = location.state?.formattedPhone || "";
  const mode = location.state?.mode || "edit"; // "reset" = lupa password, "edit" = update profil
  const resetToken = location.state?.resetToken || ""; // token khusus reset password

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // 🚨 Cegah user membuka langsung tanpa data
  useEffect(() => {
    if (!phone || (mode === "reset" && !resetToken)) {
      alert("Nomor telepon atau token tidak ditemukan.");
      return navigate(mode === "reset" ? "/forgot-password" : "/profile");
    }
  }, [phone, mode, resetToken, navigate]);

  // 🟦 Verifikasi OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return alert("Masukkan kode OTP 6 digit!");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("phone_number", phone);
      formData.append("otp_code", otp);

      // 🎯 Pilih endpoint sesuai mode
      const endpoint =
        mode === "reset" ? "/auth/verify-forgot" : "/auth/verify-update";

      const headers = { "Content-Type": "multipart/form-data" };
      
      // Untuk reset password, sertakan resetToken agar backend validasi
      if (mode === "reset") {
        formData.append("reset_token", resetToken);
      }

      await api.post(endpoint, formData, { headers });

      if (mode === "reset") {
        alert("✅ OTP benar! Silakan buat password baru.");
        navigate("/new-password", { state: { phone, resetToken } });
      } else {
        alert("✅ Profil berhasil diperbarui!");
        navigate("/profile");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "❌ OTP salah atau kadaluarsa!");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Kirim ulang OTP
  const handleResendOTP = async () => {
    try {
      setResending(true);

      const endpoint =
        mode === "reset"
          ? "/auth/forgot-password"
          : "/auth/request-update";

      const formData = new FormData();
      formData.append("phone_number", phone);

      await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("📩 Kode OTP baru telah dikirim ke WhatsApp!");
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim ulang OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          {mode === "reset" ? "Verifikasi Reset Password" : "Verifikasi OTP Profil"}
        </h2>

        <p className="text-gray-600 mb-6">
          Masukkan kode OTP yang dikirim ke <b>{phone}</b>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Masukkan Kode OTP"
            maxLength={6}
            className="w-full text-center border rounded-lg px-4 py-2 tracking-widest text-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Memverifikasi..."
              : mode === "reset"
              ? "Verifikasi & Lanjut Ganti Password"
              : "Verifikasi & Selesai"}
          </button>
        </form>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resending}
            className="text-blue-600 hover:underline text-sm"
          >
            {resending ? "Mengirim ulang..." : "Kirim ulang kode OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
