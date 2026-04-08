"use client";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";
import { useRequests } from "@/hooks/useRequests";
import {
  Card,
  Skeleton,
  PageHeader,
  StatusBadge,
  Avatar,
} from "@/components/ui";
import { getImageUrl } from "@/lib/reports";
import {
  WasteBarChart,
  EmissionsLineChart,
  WasteTypePieChart,
} from "@/components/charts/DashboardCharts";
import {
  AlertTriangle,
  Truck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Leaf,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  const { reports, loading: rLoading } = useReports(user?.$id);
  const { requests, loading: qLoading } = useRequests(user?.$id);

  const resolved = reports.filter((r) => r.status === "resolved").length;
  const pending = reports.filter((r) => r.status === "pending").length;

  const stats = [
    {
      label: "Total Reports",
      value: rLoading ? "—" : reports.length,
      icon: AlertTriangle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Resolved",
      value: rLoading ? "—" : resolved,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending",
      value: rLoading ? "—" : pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Pickup Requests",
      value: qLoading ? "—" : requests.length,
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <AppShell>
      <div className="animate-in">
        {/* Custom header with profile image */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar
            src={
              user?.profile_picture
                ? getImageUrl(user.profile_picture)
                : undefined
            }
            name={user?.name || "User"}
            size="lg"
          />
          <div>
            <h1
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Good day, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Here's what's happening in your GoHigher account
            </p>
          </div>
        </div>

        {/* Impact banner */}
        <div
          className="mb-8 rounded-2xl p-5 flex items-center gap-4 overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
          }}
        >
          <div className="absolute right-0 top-0 h-full w-64 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 bg-yellow-400 rounded-full blur-2xl" />
          </div>
          <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-7 h-7 text-blue-700" />
          </div>
          <div className="flex-1 relative z-10">
            <p
              className="text-white font-bold text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Your environmental impact
            </p>
            <p className="text-blue-200 text-sm">
              You've helped keep Kampala cleaner. Keep going!
            </p>
          </div>
          <div className="flex gap-6 relative z-10">
            <div className="text-center">
              <p
                className="text-2xl font-bold text-yellow-400"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {reports.length}
              </p>
              <p className="text-blue-200 text-xs">Reports</p>
            </div>
            <div className="text-center">
              <p
                className="text-2xl font-bold text-yellow-400"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {requests.length}
              </p>
              <p className="text-blue-200 text-xs">Pickups</p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="p-5">
              <div
                className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              {rLoading || qLoading ? (
                <Skeleton className="h-7 w-16 mb-1" />
              ) : (
                <p
                  className="text-2xl font-bold text-slate-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {value}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <WasteBarChart />
          </div>
          <WasteTypePieChart />
        </div>
        <div className="mb-8">
          <EmissionsLineChart />
        </div>

        {/* Recent reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3
              className="font-bold text-slate-800"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Recent Reports
            </h3>
            <Link
              href="/report"
              className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {rLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No reports yet.{" "}
              <Link href="/report" className="text-blue-600 hover:underline">
                File your first report
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div
                  key={report.$id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {report.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {report.location} ·{" "}
                      {formatDistanceToNow(new Date(report.$createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            {
              href: "/report",
              label: "File a Report",
              icon: AlertTriangle,
              color: "bg-blue-600",
            },
            {
              href: "/requests",
              label: "Schedule Pickup",
              icon: Truck,
              color: "bg-purple-600",
            },
            {
              href: "/marketplace",
              label: "Browse Market",
              icon: TrendingUp,
              color: "bg-green-600",
            },
            {
              href: "/education",
              label: "Learn More",
              icon: Leaf,
              color: "bg-yellow-500",
            },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
