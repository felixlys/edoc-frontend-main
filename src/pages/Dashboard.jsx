import React, { useEffect, useState } from "react";
import { getDashboard } from "../services/documents";
import DocumentList from "../components/DocumentList";
import DocumentDetail from "../components/DocumentDetail";
import {
  CheckCircleIcon,
  InboxIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { XCircleIcon, PencilSquareIcon } from "@heroicons/react/24/solid";

// Summary Card Component
function SummaryListCard({ icon, title, count, unread }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col relative">
      {unread > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold px-1.5 rounded-full">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
    </div>
  );
}

// Helper: Sort by date descending
const sortByDateDesc = (docs) =>
  docs?.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    approved_by_me: [],
    my_finalized: [],
    ready_to_approve: [],
    inbox: [],
  });

  const [activeTab, setActiveTab] = useState("approved_by_me");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();

      const allDocs = [
        ...(data?.approved_by_me || []),
        ...(data?.my_finalized || []),
        ...(data?.ready_to_approve || []),
        ...(data?.inbox || []),
      ];

      const rejectedDocs = allDocs.filter((d) =>
        d.status?.toLowerCase().includes("ditolak") ||
        d.status?.toLowerCase().includes("reject")
      );

      const revisedDocs = allDocs.filter((d) =>
        d.status?.toLowerCase().includes("revisi") ||
        d.status?.toLowerCase().includes("revise")
      );

      setDashboard({
        approved_by_me: sortByDateDesc(data?.approved_by_me),
        my_finalized: sortByDateDesc(data?.my_finalized),
        ready_to_approve: sortByDateDesc(data?.ready_to_approve),
        inbox: sortByDateDesc(
          (data?.inbox || []).filter(
            (d) =>
              !d.status?.toLowerCase().includes("revisi") &&
              !d.status?.toLowerCase().includes("revise")
          )
        ),
        ditolak: rejectedDocs,
        revisi: revisedDocs,
      });

      setError(null);
    } catch (err) {
      console.error("Gagal memuat dashboard:", err);
      setError("Tidak dapat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const tabLabels = {
    approved_by_me: "On Going",
    my_finalized: "Sent",
    ready_to_approve: "Waiting My Approval",
    inbox: "Inbox",
    revisi: "Revise",
  };

  const getCurrentDocs = () => dashboard?.[activeTab] || [];

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <span className="animate-pulse">Memuat dashboard...</span>
      </div>
    );

  if (error)
    return (
      <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={fetchDashboard}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <SummaryListCard
          icon={<CheckCircleIcon className="w-8 h-8 text-green-500" />}
          title="Approved"
          count={dashboard.approved_by_me?.length || 0}
        />
        <SummaryListCard
          icon={<XCircleIcon className="w-8 h-8 text-red-500" />}
          title="Rejected"
          count={dashboard.ditolak?.length || 0}
        />
        <SummaryListCard
          icon={<PencilSquareIcon className="w-8 h-8 text-orange-500" />}
          title="Revised"
          count={dashboard.revisi?.length || 0}
        />
        <SummaryListCard
          icon={<ClipboardDocumentListIcon className="w-8 h-8 text-blue-500" />}
          title="Sent"
          count={dashboard.my_finalized?.length || 0}
        />
        <SummaryListCard
          icon={<ClockIcon className="w-8 h-8 text-yellow-500" />}
          title="Waiting"
          count={dashboard.ready_to_approve?.length || 0}
          unread={dashboard.ready_to_approve?.filter((d) => !d.is_read)?.length}
        />
        <SummaryListCard
          icon={<InboxIcon className="w-8 h-8 text-gray-500" />}
          title="Inbox"
          count={dashboard.inbox?.length || 0}
          unread={dashboard.inbox?.filter((d) => !d.is_read)?.length}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {Object.keys(tabLabels).map((tab) => {
          let unread = 0;

          if (tab === "inbox" || tab === "ready_to_approve") {
            unread = dashboard?.[tab]?.filter((d) => !d.is_read)?.length || 0;
          }

          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedDoc(null);
              }}
              className={`relative px-4 py-2 rounded-t-lg font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {tabLabels[tab]}
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 rounded-full">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-3">
          <DocumentList documents={getCurrentDocs()} onSelect={setSelectedDoc} />
        </div>

        {/* Right: Document Detail */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          {selectedDoc ? (
            <DocumentDetail
              doc={selectedDoc}
              activeTab={activeTab}
              onUpdate={async (updatedDoc) => {
                setDashboard((prev) => {
                  const updated = { ...prev };
                  for (const key of Object.keys(updated)) {
                    updated[key] = updated[key].map((doc) =>
                      doc.id === updatedDoc.id ? updatedDoc : doc
                    );
                  }
                  return updated;
                });
                setSelectedDoc(updatedDoc);
                await fetchDashboard();
              }}
            />
          ) : (
            <div className="text-gray-400 text-center py-20">
              📄 Pilih dokumen untuk melihat detailnya
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
