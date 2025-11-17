import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import GmailStyleComposeTiptap from "../components/GmailStyleComposeTiptap";
import api from "../services/api";

export default function EditDocument() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    async function fetchDoc() {
      const res = await api.get(`/documents/${id}`);
      setDoc(res.data);
    }
    fetchDoc();
  }, [id]);

  if (!doc) return <p>Loading...</p>;

  return <GmailStyleComposeTiptap mode="edit" existingDoc={doc} />;
}
