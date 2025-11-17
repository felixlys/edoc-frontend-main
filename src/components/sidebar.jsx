import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { UnreadContext } from "../components/UnreadContext";

export default function Sidebar() {
  const { logout, user } = useContext(AuthContext);
  const { unreadInbox, unreadWaiting } = useContext(UnreadContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Keluar dari akun ini?")) {
      logout();
      navigate("/login");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Inbox", path: "/inbox", count: unreadInbox },
    { name: "Waiting", path: "/waiting", count: unreadWaiting },
    { name: "Sent", path: "/sent" },
    { name: "Revisi", path: "/revisions" },
    { name: "Logout", action: handleLogout },
  ];

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  const avatarUrl = user?.avatar || null;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-blue-600 text-white">
        <span className="font-semibold text-lg">📄 Edoc Timur Jaya</span>
        <button onClick={() => setOpen(!open)} className="focus:outline-none">
          {open ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-50 shadow-md flex flex-col justify-between
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Header Desktop */}
          <div className="hidden md:block px-4 py-6 border-b">
            <h1 className="text-xl font-bold text-blue-700">Edoc Timur Jaya</h1>
            <p className="text-gray-500 text-sm">Email Approval System</p>
          </div>

          {/* Compose Button */}
          <div className="p-4">
            <button
              onClick={() => navigate("/create-document")}
              className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl shadow-md font-semibold transition-all"
            >
              <span className="bg-white text-blue-600 font-bold rounded-full w-6 h-6 flex items-center justify-center">
                +
              </span>
              Create
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) =>
              item.action ? (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-red-100 hover:text-red-600 text-left"
                >
                  {item.name}
                </button>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition-colors ${
                      isActive
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                    }`
                  }
                >
                  <span>{item.name}</span>
                  {item.count > 0 && (
                    <span className="ml-2 bg-yellow-400 text-black px-2 rounded-full text-xs">
                      {item.count}
                    </span>
                  )}
                </NavLink>
              )
            )}
          </nav>
        </div>

        {/* Bottom Avatar */}
        <div className="border-t bg-white p-4 flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-blue-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              {firstLetter}
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-700 leading-tight">{user?.name || "User"}</p>
            <p
              className="text-xs text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/profile/edit")}
            >
              Edit Profil
            </p>
          </div>
        </div>

        <div className="text-gray-400 text-xs text-center py-3 border-t bg-gray-50">
          © PT Timur Jaya Indo Steel 2025
        </div>
      </div>
    </>
  );
}
