import api from "./api";

/* ============================
   DASHBOARD
============================ */
export const getDashboard = async () => {
   const token = localStorage.getItem("token");
   const res = await api.get("/files/documents/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

/* ============================
   TRASH
============================ */
export const getTrash = async () => {
   const token = localStorage.getItem("token");
   const res = await api.get("/trash/files", {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

/* ============================
   DELETE INBOX / SENT
============================ */
export const deleteInbox = async (id) => {
   const token = localStorage.getItem("token");
   const res = await api.delete(`/files/documents/inbox/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

export const deleteSent = async (id) => {
   const token = localStorage.getItem("token");
   const res = await api.delete(`/files/documents/sent/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

/* ============================
   APPROVAL ACTIONS
============================ */
export const apiApprove = async (id) => {
   const token = localStorage.getItem("token");
   const res = await api.post(`/documents/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

export const apiReject = async (id, reason) => {
   const token = localStorage.getItem("token");
   const res = await api.post(`/documents/${id}/reject`, { reason }, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

export const apiRevise = async (id, note) => {
   const token = localStorage.getItem("token");
   const res = await api.post(`/documents/${id}/revise`, { note }, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

/* ============================
   FILE DOWNLOADS
============================ */
export const apiDownloadFile = async (documentId, fileId) => {
   const token = localStorage.getItem("token");
   return api.get(`/files/documents/${documentId}/file/${fileId}`, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
   });
};

export const apiDownloadStamped = async (documentId) => {
   const token = localStorage.getItem("token");
   return api.get(`/files/documents/${documentId}/stamped`, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
   });
};

/* ============================
   WAITING MY APPROVAL
============================ */
export const getWaitingApproval = async () => {
   const token = localStorage.getItem("token");
   const res = await api.get("/files/documents/waiting", {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

/* ============================
   REASONS & DOCUMENT DETAIL
============================ */
export const apiGetReasons = (docId) => {
   const token = localStorage.getItem("token");
   return api.get(`/documents/${docId}/reasons`, {
      headers: { Authorization: `Bearer ${token}` },
   });
};

export const apiGetDocumentDetail = async (docId) => {
   if (!docId) throw new Error("docId is undefined");
   const token = localStorage.getItem("token");
   const res = await api.get(`/documents/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

/* ============================
   EDIT DOCUMENT / UPLOAD REVISED FILE
============================ */
export const apiEditDocument = async (docId, data) => {
   const token = localStorage.getItem("token");
   const res = await api.put(`/documents/${docId}/edit`, data, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

export const apiUploadRevisedFile = (docId, file) => {
   const token = localStorage.getItem("token");
   const formData = new FormData();
   formData.append("file", file);
   return api.put(`/documents/${docId}/revise/upload`, formData, {
      headers: {
         Authorization: `Bearer ${token}`,
         "Content-Type": "multipart/form-data",
      },
   });
};

/* ============================
   🔹 UPDATE PROFIL (MINTA OTP)
============================ */
export const apiRequestUpdateProfile = async (data) => {
   // data: { name, phone_number, current_password?, new_password? }
   const token = localStorage.getItem("token");
   const formData = new FormData();
   Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
   });

   const res = await api.post("/auth/request-update", formData, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};

/* ============================
   🔹 VERIFIKASI OTP (UNTUK UPDATE PROFIL)
============================ */
export const apiVerifyUpdateProfile = async (data) => {
   // data: { phone_number, otp_code }
   const token = localStorage.getItem("token");
   const formData = new FormData();
   Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
   });

   const res = await api.post("/auth/verify-update", formData, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return res.data;
};
export const apiMarkRead = async (id) => {
  const token = localStorage.getItem("token");
  const res = await api.post(`/files/documents/${id}/mark-read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const getUnreadDocuments = async () => {
  const token = localStorage.getItem("token");
  const res = await api.get("/files/documents/unread", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const adminSetUserPassword = async (masterKey, user_id, new_password) => {
  const res = await api.put(
    "/admin/user/password",
    { user_id, new_password },
    { headers: { "X-MASTER-KEY": masterKey } }
  );
  return res.data;
};

export const adminDeleteUser = async (masterKey, user_id, hard_delete = false) => {
  const res = await api.delete("/admin/user", {
    headers: { "X-MASTER-KEY": masterKey },
    data: { user_id, hard_delete },
  });
  return res.data;
};