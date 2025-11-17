import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <img
          src={
            user?.avatar
              ? `http://127.0.0.1:8000${user.avatar}`
              : "https://via.placeholder.com/100"
          }
          alt="Avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
        />
        <h2 className="text-xl font-semibold">{user?.name}</h2>
        <p className="text-gray-600">{user?.email}</p>
        <p className="text-gray-500">{user?.phone_number}</p>
      </div>
    </div>
  );
}



