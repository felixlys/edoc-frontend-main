import React, { useState, useContext } from "react";
import api, { setAuthToken } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, user } = res.data;
      login(user, access_token);
      setAuthToken(access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login gagal. Periksa email dan password kamu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          E-Document System
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Masuk untuk mengelola dokumen dan persetujuan Anda
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-100 rounded-lg px-4 py-2 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-100 rounded-lg px-4 py-2 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        {/* 🔹 Tambahkan tombol ke halaman signup */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Belum punya akun?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:underline"
          >
            Daftar Sekarang
          </Link>
        </p>
        <p className="text-center text-gray-500 text-sm mt-3">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Lupa Password?
          </Link>
        </p>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} PT Timur Jaya Indo Steel
        </p>
      </div>
    </div>
  );
}
