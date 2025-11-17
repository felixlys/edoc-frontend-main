import { createContext, useState, useEffect, useContext } from "react";
import { getDashboard } from "../services/documents";
import { AuthContext } from "../context/AuthContext";

export const UnreadContext = createContext();

export function UnreadProvider({ children }) {
  const { user: currentUser } = useContext(AuthContext);

  const [unreadInbox, setUnreadInbox] = useState(0);
  const [unreadWaiting, setUnreadWaiting] = useState(0);

  // ==========================
  // 🔄 COUNTERS
  // ==========================
  const refreshUnread = async () => {
    try {
      const data = await getDashboard();
      setUnreadInbox(data?.inbox?.filter((d) => !d.is_read).length || 0);
      setUnreadWaiting(
        data?.ready_to_approve?.filter((d) => !d.is_read).length || 0
      );
    } catch (err) {
      console.error("Gagal hitung unread:", err);
    }
  };

  const incrementInbox = () => setUnreadInbox((p) => p + 1);
  const decrementInbox = () => setUnreadInbox((p) => Math.max(p - 1, 0));

  const incrementWaiting = () => setUnreadWaiting((p) => p + 1);
  const decrementWaiting = () => setUnreadWaiting((p) => Math.max(p - 1, 0));

  // ==========================
  // 🔌 WEBSOCKET LISTENER
  // ==========================
  useEffect(() => {
    if (!currentUser) return;

    let ws;
    let heartbeat;

    const connectWS = () => {
      ws = new WebSocket("ws://localhost:8000/ws/unread");

      ws.onopen = () => {
        console.log("WS connected");

        heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        console.log("WS RAW:", event.data);

        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        // ==========================
        // 🔥 SWITCH EVENT BACKEND
        // ==========================
        switch (data.event) {
          // ----------------------------------------------------
          // 📩 Dokumen baru → semua recipient masuk inbox
          // ----------------------------------------------------
          case "document_created":
            if (data.creator_id !== currentUser.id) {
              incrementInbox();
            }
            break;

          // ----------------------------------------------------
          // 🎯 Assign approver / recipient
          // ----------------------------------------------------
          case "document_assigned":
            const approvers = data.approver_ids || [];
            const recipients = data.recipient_ids || [];

            if (recipients.includes(currentUser.id)) incrementInbox();
            if (approvers.includes(currentUser.id)) incrementWaiting();
            break;

          // ----------------------------------------------------
          // ✔ Approve / ❌ Reject → kurangi waiting
          // ----------------------------------------------------
          case "approval_status_changed":
            if (data.user_id === currentUser.id) {
              decrementWaiting();
            }
            break;

          // ----------------------------------------------------
          // 👁 User membaca dokumen → kurangi inbox
          // ----------------------------------------------------
          case "document_read":
            if (data.user_id === currentUser.id) {
              decrementInbox();
            }
            break;

          default:
            break;
        }
      };

      ws.onclose = () => {
        console.log("WS closed. reconnecting...");
        clearInterval(heartbeat);
        setTimeout(()=>{
          if (ws.readyState === WebSocket.CLOSED) connectWS();
        },3000)
      };
    };

    connectWS();
    refreshUnread();

    return () => {
      clearInterval(heartbeat);
      ws?.close();
    };
  }, [currentUser]);

  return (
    <UnreadContext.Provider
      value={{
        unreadInbox,
        unreadWaiting,
        refreshUnread,
        incrementInbox,
        incrementWaiting,
        decrementInbox,
        decrementWaiting,
      }}
    >
      {children}
    </UnreadContext.Provider>
  );
}
