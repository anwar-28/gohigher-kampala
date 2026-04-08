"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getReports, updateReportStatus, Report } from "@/lib/reports";
import {
  getMessages,
  respondToMessage,
  getGarbageRequests,
  updateGarbageStatus,
  Message,
  GarbageRequest,
} from "@/lib/services";
import {
  Button,
  Card,
  PageHeader,
  StatusBadge,
  Select,
  Skeleton,
} from "@/components/ui";
import {
  Shield,
  AlertTriangle,
  Mail,
  Truck,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

type Tab = "reports" | "requests" | "messages";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [requests, setRequests] = useState<GarbageRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      toast.error("Admin access required");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r, req, m] = await Promise.all([
          getReports(),
          getGarbageRequests(),
          getMessages(),
        ]);
        setReports(r);
        setRequests(req);
        setMessages(m);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "admin") load();
  }, [user]);

  const handleStatusChange = async (id: string, status: Report["status"]) => {
    await updateReportStatus(id, status);
    setReports((prev) =>
      prev.map((r) => (r.$id === id ? { ...r, status } : r)),
    );
    toast.success("Status updated");
  };

  const handleRequestStatus = async (
    id: string,
    status: GarbageRequest["status"],
  ) => {
    await updateGarbageStatus(id, status);
    setRequests((prev) =>
      prev.map((r) => (r.$id === id ? { ...r, status } : r)),
    );
    toast.success("Status updated");
  };

  const handleReply = async (msgId: string) => {
    if (!reply[msgId]?.trim()) return;
    setSending(msgId);
    await respondToMessage(msgId, reply[msgId]);
    setMessages((prev) =>
      prev.map((m) => (m.$id === msgId ? { ...m, response: reply[msgId] } : m)),
    );
    setReply((prev) => ({ ...prev, [msgId]: "" }));
    toast.success("Reply sent");
    setSending(null);
  };

  const tabs: {
    key: Tab;
    label: string;
    icon: React.ElementType;
    count: number;
  }[] = [
    {
      key: "reports",
      label: "Reports",
      icon: AlertTriangle,
      count: reports.length,
    },
    {
      key: "requests",
      label: "Pickup Requests",
      icon: Truck,
      count: requests.length,
    },
    {
      key: "messages",
      label: "Messages",
      icon: Mail,
      count: messages.filter((m) => !m.response).length,
    },
  ];

  if (authLoading || user?.role !== "admin") return null;

  return (
    <AppShell>
      <div className="animate-in">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage reports, requests, and citizen messages"
        />

        {/* Admin badge */}
        <div className="mb-6 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 w-fit">
          <Shield className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-800">
            Administrator Access
          </span>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Reports",
              value: reports.length,
              icon: AlertTriangle,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Open Requests",
              value: requests.filter((r) => r.status !== "completed").length,
              icon: Truck,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "Unread Messages",
              value: messages.filter((m) => !m.response).length,
              icon: MessageSquare,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="p-5 flex items-center gap-4">
              <div
                className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p
                  className="text-2xl font-bold text-slate-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {value}
                </p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={15} />
              {label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    tab === key
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports tab */}
        {tab === "reports" &&
          (loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card key={report.$id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">
                        {report.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {report.location} ·{" "}
                        {formatDistanceToNow(new Date(report.$createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={report.status} />
                      <Select
                        value={report.status}
                        onChange={(e) =>
                          handleStatusChange(
                            report.$id,
                            e.target.value as Report["status"],
                          )
                        }
                        options={[
                          { value: "pending", label: "Pending" },
                          { value: "in_progress", label: "In Progress" },
                          { value: "resolved", label: "Resolved" },
                        ]}
                        className="w-36 text-xs py-1.5"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}

        {/* Requests tab */}
        {tab === "requests" &&
          (loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req.$id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">
                        {req.waste_type}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        📍 Location: {req.location}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Requested: {new Date(req.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={req.status} />
                      <Select
                        value={req.status}
                        onChange={(e) =>
                          handleRequestStatus(
                            req.$id,
                            e.target.value as GarbageRequest["status"],
                          )
                        }
                        options={[
                          { value: "pending", label: "Pending" },
                          { value: "scheduled", label: "Scheduled" },
                          { value: "completed", label: "Completed" },
                        ]}
                        className="w-36 text-xs py-1.5"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}

        {/* Messages tab */}
        {tab === "messages" &&
          (loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <Card key={msg.$id} className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail size={14} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{msg.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(msg.$createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {msg.response && (
                      <CheckCircle2
                        size={16}
                        className="text-green-500 flex-shrink-0"
                      />
                    )}
                  </div>

                  {msg.response ? (
                    <div className="ml-11 p-3 bg-green-50 rounded-xl">
                      <p className="text-xs font-semibold text-green-700 mb-1">
                        Your reply:
                      </p>
                      <p className="text-sm text-green-800">{msg.response}</p>
                    </div>
                  ) : (
                    <div className="ml-11 flex gap-2">
                      <input
                        placeholder="Type a reply..."
                        value={reply[msg.$id] || ""}
                        onChange={(e) =>
                          setReply((prev) => ({
                            ...prev,
                            [msg.$id]: e.target.value,
                          }))
                        }
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReply(msg.$id)}
                        loading={sending === msg.$id}
                      >
                        Reply
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ))}
      </div>
    </AppShell>
  );
}
