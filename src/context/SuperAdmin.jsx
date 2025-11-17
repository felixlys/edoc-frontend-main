import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function SuperAdmin() {
  const [masterKey, setMasterKey] = useState("");
  const [verified, setVerified] = useState(false);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [logs, setLogs] = useState([]);

  // 🔹 Ambil daftar user dari backend
  const loadUsers = async () => {
    try {
      const res = await api.get("/users/users");
      setUsers(res.data);
    } catch (err) {
      alert("❌ Gagal memuat daftar user");
    }
  };

  // 🔹 Ambil file log admin (statis)
  const loadLogs = async () => {
    try {
      const res = await fetch("http://localhost:8000/uploads/admin_actions.log");
      if (!res.ok) throw new Error("Log belum ada");
      const text = await res.text();
      setLogs(text.split("\n").filter(Boolean).reverse());
    } catch {
      setLogs(["Belum ada log admin."]);
    }
  };

  useEffect(() => {
    if (verified) {
      loadUsers();
      loadLogs();
    }
  }, [verified]);

  const handleVerify = () => {
    if (!masterKey.trim()) return alert("Masukkan MASTER KEY dulu!");
    setVerified(true);
  };

  const handleChangePassword = async () => {
    if (!userId || !newPassword.trim())
      return alert("Lengkapi data user dan password!");
    setLoading(true);
    setResult("");
    try {
      const res = await api.put(
        "/auth/admin/user/password",
        null,
        {
          params: { user_id: userId, new_password: newPassword },
          headers: { "X-MASTER-KEY": masterKey },
        }
      );
      setResult("✅ " + res.data.message);
      setNewPassword("");
      loadLogs();
    } catch (err) {
      setResult("❌ " + (err.response?.data?.detail || "Gagal ubah password"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId) return alert("Pilih user terlebih dahulu!");
    if (!window.confirm("Yakin ingin hapus user ini BESERTA semua datanya?"))
      return;
    setLoading(true);
    setResult("");
    try {
      const res = await api.delete("/auth/admin/user", {
        headers: { "X-MASTER-KEY": masterKey },
        params: { user_id: userId, hard_delete: true },
      });
      setResult("🗑️ " + res.data.message);
      setUserId("");
      loadUsers();
      loadLogs();
    } catch (err) {
      setResult("❌ " + (err.response?.data?.detail || "Gagal hapus user"));
    } finally {
      setLoading(false);
    }
  };

  if (!verified) {
    return (
      <div className="max-w-sm mx-auto mt-20 text-center bg-white shadow p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4 text-blue-600">
          🔐 Verifikasi Super Admin
        </h2>
        <input
          type="password"
          value={masterKey}
          onChange={(e) => setMasterKey(e.target.value)}
          placeholder="Masukkan Master Key"
          className="w-full border p-2 rounded mb-4"
        />
        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Masuk Panel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white shadow-lg p-6 rounded-2xl border">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        ⚙️ Super Admin Panel
      </h2>

      {/* User List */}
      <button
        onClick={loadUsers}
        className="text-sm text-blue-600 underline mb-2"
      >
        🔄 Refresh Daftar User
      </button>
      <div className="border p-2 rounded mb-4 max-h-48 overflow-y-auto text-sm bg-gray-50">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => setUserId(u.id)}
            className={`cursor-pointer p-1 rounded ${
              userId == u.id ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
            }`}
          >
            {u.id}. {u.name} ({u.email})
          </div>
        ))}
      </div>

      {/* Actions */}
      <input
        type="text"
        placeholder="Password baru"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />
      <button
        onClick={handleChangePassword}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mb-3"
      >
        {loading ? "Memproses..." : "Ubah Password User"}
      </button>

      <button
        onClick={handleDeleteUser}
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
      >
        {loading ? "Memproses..." : "Hapus User Permanen"}
      </button>

      {result && (
        <p
          className={`mt-4 text-center text-sm ${
            result.startsWith("✅")
              ? "text-green-600"
              : result.startsWith("🗑️")
              ? "text-orange-600"
              : "text-red-600"
          }`}
        >
          {result}
        </p>
      )}

      {/* Log */}
      <h3 className="mt-6 mb-2 text-center font-semibold text-gray-700">
        📜 Riwayat Admin
      </h3>
      <div className="border rounded p-2 max-h-40 overflow-y-auto text-xs bg-gray-50">
        {logs.length > 0
          ? logs.map((l, i) => <div key={i}>{l}</div>)
          : <div className="text-gray-400 italic">Belum ada log</div>}
      </div>
    </div>
  );
}
