import React, { useContext, memo } from "react";
import { NotificationContext } from "../components/NotificationContext";

function Notifications() {
  const { notifications = [], markAsRead } = useContext(NotificationContext) || {};

  // ⛔ Cegah error kalau context belum siap
  if (!notifications) return null;

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 w-72">
      {unread.length === 0 ? null : unread.map((notif) => (
        <div
          key={notif.id}
          onClick={() => markAsRead?.(notif.id)}
          className="cursor-pointer bg-white p-3 rounded-lg shadow-lg border-l-4 border-blue-500 hover:bg-blue-50 transition-transform transform hover:scale-[1.02]"
        >
          <p className="font-semibold text-gray-800 truncate">{notif.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            {notif.type === "inbox" ? "📥 Inbox" : "⏳ Waiting Approval"}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {new Date(notif.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

// 🔹 Gunakan memo biar gak rerender terus saat context lain berubah
export default memo(Notifications);
