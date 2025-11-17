import React, { createContext, useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUnreadDocuments } from "../services/documents"; // endpoint /documents/unread

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]); // {id, title, type, created_at, read}

  // 🟩 Tambah notifikasi baru
  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  // 🟦 Tandai notifikasi sudah dibaca
  const markAsRead = (docId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === docId ? { ...n, read: true } : n))
    );
  };

  // 🟨 Load dokumen unread dari server
  const loadUnread = async () => {
    if (!user || !token) return; // 🔹 pastikan user & token siap
    try {
      const data = await getUnreadDocuments(); // axios otomatis kirim Bearer token
      const inbox = (data.inbox || []).map((d) => ({ ...d, read: false }));
      const waiting = (data.waiting || []).map((d) => ({ ...d, read: false }));
      const merged = [...inbox, ...waiting].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setNotifications(merged);
    } catch (err) {
      console.error("❌ Failed to load unread docs:", err);
    }
  };

  // 🟧 Jalankan loadUnread & hubungkan WebSocket
  useEffect(() => {
    if (!user || !token) return; // pastikan user login

    loadUnread(); // pertama kali login → ambil unread dari server

    // WebSocket URL — bisa disesuaikan ke backend kamu
    const ws = new WebSocket("ws://localhost:8000/ws/unread");

    ws.onopen = () => console.log("✅ WebSocket connected for notifications");
    ws.onclose = () => console.log("⚠️ WebSocket disconnected");

    ws.onmessage = (event) => {
      try {
         if (event.data === "ping" || event.data === "pong") return;
        const data = JSON.parse(event.data);

        switch (data.event) {
          case "document_created":
            if (data.creator_id !== user.id) {
              addNotification({
                id: data.document_id,
                title: data.title,
                type: "inbox",
                created_at: new Date(),
                read: false,
              });
            }
            break;

          case "document_assigned":
            if (data.recipient_ids?.includes(user.id)) {
              addNotification({
                id: data.document_id,
                title: data.title || "Assigned Document",
                type: "inbox",
                created_at: new Date(),
                read: false,
              });
            }
            if (data.approver_ids?.includes(user.id)) {
              addNotification({
                id: data.document_id,
                title: data.title || "Waiting Approval",
                type: "waiting",
                created_at: new Date(),
                read: false,
              });
            }
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("❌ WS parse error:", err);
      }
    };

    // cleanup saat komponen unmount
    return () => ws.close();
  }, [user, token]); // 🔹 jalankan ulang jika user/token berubah

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
