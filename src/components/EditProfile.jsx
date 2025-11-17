import React, { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
          const { user, token } = useContext(AuthContext);
          const navigate = useNavigate();

          const [name, setName] = useState("");
          const [phoneNumber, setPhoneNumber] = useState("");
          const [avatar, setAvatar] = useState(null);
          const [preview, setPreview] = useState(null);
          const [currentPassword, setCurrentPassword] = useState("");
          const [newPassword, setNewPassword] = useState("");
          const [confirmPassword, setConfirmPassword] = useState("");
          const [loading, setLoading] = useState(false);
          const [showPassword, setShowPassword] = useState(false);

          useEffect(() => {
                    if (user && !phoneNumber) {
                              setName(user.name || "");
                              setPhoneNumber(user.phone_number || "");
                              setPreview(user.avatar || null);
                    }
          }, [user, phoneNumber]);

          const formatPhoneNumber = (input) => {
                    let phone = input.trim().replace(/[^0-9+]/g, "");
                    if (phone.startsWith("0")) return "62" + phone.slice(1);
                    if (!phone.startsWith("62")) return "62" + phone;
                    return phone;
          };

          const handleAvatarChange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                              setAvatar(file);
                              setPreview(URL.createObjectURL(file));
                    }
          };

          const handleSubmit = async (e) => {
                    e.preventDefault();
                    if (newPassword && newPassword !== confirmPassword) {
                              return alert("Password baru tidak cocok!");
                    }

                    const formattedPhone = formatPhoneNumber(phoneNumber);
                    const phoneRegex = /^62\d{8,14}$/;
                    if (!phoneRegex.test(formattedPhone)) {
                              return alert("Nomor telepon harus valid (contoh: 6281234567890)");
                    }

                    try {
                              setLoading(true);

                              const formData = new FormData();
                              formData.append("name", name);
                              formData.append("phone_number", formattedPhone);
                              if (avatar) formData.append("avatar", avatar);
                              if (newPassword) {
                                        formData.append("current_password", currentPassword);
                                        formData.append("new_password", newPassword);
                              }

                              await api.post("/auth/request-update", formData, {
                                        headers: {
                                                  Authorization: `Bearer ${token}`,
                                                  "Content-Type": "multipart/form-data",
                                        },
                              });

                              alert("Kode OTP telah dikirim ke WhatsApp dan SMS Anda!");
                              navigate("/send-otp", { state: { formattedPhone } });
                    } catch (err) {
                              console.error(err);
                              alert("Gagal mengirim OTP. Pastikan data valid.");
                    } finally {
                              setLoading(false);
                    }
          };

          return (
                    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
                              <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                                        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
                                                  Edit Profil
                                        </h2>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                                  <div className="text-gray-500 text-sm">
                                                            <p>Nama lama: {user?.name || "-"}</p>
                                                            <p>No HP lama: {user?.phone_number || "-"}</p>
                                                  </div>

                                                  {/* 🖼️ Upload Avatar */}
                                                  <div className="flex flex-col items-center space-y-2">
                                                            {preview ? (
                                                                      <img
                                                                                src={preview}
                                                                                alt="avatar"
                                                                                className="w-24 h-24 rounded-full object-cover border"
                                                                      />
                                                            ) : user?.avatar ? (
                                                                      <img
                                                                                src={user.avatar}
                                                                                alt="avatar"
                                                                                className="w-24 h-24 rounded-full object-cover border"
                                                                      />
                                                            ) : (
                                                                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                                                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                                                                      </div>
                                                            )}
                                                            <input
                                                                      type="file"
                                                                      accept="image/*"
                                                                      onChange={handleAvatarChange}
                                                                      className="text-sm text-gray-600"
                                                            />
                                                  </div>

                                                  <input
                                                            type="text"
                                                            placeholder="Nama baru"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            className="w-full border rounded-lg px-4 py-2"
                                                  />
                                                  <input
                                                            type="tel"
                                                            placeholder="Nomor Telepon baru (contoh: 087810720777)"
                                                            value={phoneNumber}
                                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                                            className="w-full border rounded-lg px-4 py-2"
                                                            required
                                                  />

                                                  <div className="relative">
                                                            <input
                                                                      type={showPassword ? "text" : "password"}
                                                                      placeholder="Password lama (opsional)"
                                                                      value={currentPassword}
                                                                      onChange={(e) => setCurrentPassword(e.target.value)}
                                                                      className="w-full border rounded-lg px-4 py-2 pr-10"
                                                            />
                                                            <span
                                                                      className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                                                                      onClick={() => setShowPassword(!showPassword)}
                                                            >
                                                                      {showPassword ? "🙈" : "👁️"}
                                                            </span>
                                                  </div>

                                                  <input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Password baru"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="w-full border rounded-lg px-4 py-2"
                                                  />
                                                  <input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Ulangi password baru"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className="w-full border rounded-lg px-4 py-2"
                                                  />

                                                  <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                                                                      loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
                                                            }`}
                                                  >
                                                            {loading ? "Mengirim OTP..." : "Simpan & Kirim OTP"}
                                                  </button>
                                        </form>
                              </div>
                    </div>
          );
}
