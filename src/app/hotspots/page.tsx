"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getHotspots, Hotspot } from "@/lib/services";
import { HotspotsMap } from "@/components/charts/HotspotsMap";
import { Card, PageHeader, Skeleton } from "@/components/ui";
import { MapPin, Flame, AlertTriangle, TrendingUp } from "lucide-react";

const severityConfig: Record<
  number,
  { label: string; color: string; bg: string; bar: string }
> = {
  1: {
    label: "Low",
    color: "text-green-700",
    bg: "bg-green-100",
    bar: "bg-green-500",
  },
  2: {
    label: "Moderate",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    bar: "bg-yellow-500",
  },
  3: {
    label: "High",
    color: "text-orange-700",
    bg: "bg-orange-100",
    bar: "bg-orange-500",
  },
  4: {
    label: "Critical",
    color: "text-red-700",
    bg: "bg-red-100",
    bar: "bg-red-500",
  },
  5: {
    label: "Emergency",
    color: "text-red-900",
    bg: "bg-red-200",
    bar: "bg-red-700",
  },
};

// Mock hotspots for display if DB is empty
const MOCK_HOTSPOTS: Hotspot[] = [
  {
    $id: "1",
    location: "Owino Market, Kampala",
    severity_level: 5,
    report_count: 47,
  },
  {
    $id: "2",
    location: "Bwaise, Kawempe Division",
    severity_level: 4,
    report_count: 32,
  },
  {
    $id: "3",
    location: "Nakawa Industrial Area",
    severity_level: 4,
    report_count: 28,
  },
  {
    $id: "4",
    location: "Kisenyi, Central Division",
    severity_level: 3,
    report_count: 21,
  },
  { $id: "5", location: "Ndeeba, Rubaga", severity_level: 3, report_count: 19 },
  { $id: "6", location: "Kisekka Market", severity_level: 2, report_count: 12 },
  {
    $id: "7",
    location: "Ntinda Trading Centre",
    severity_level: 2,
    report_count: 9,
  },
  { $id: "8", location: "Kalerwe Market", severity_level: 1, report_count: 5 },
];

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotspots()
      .then((data) => setHotspots(data.length > 0 ? data : MOCK_HOTSPOTS))
      .catch(() => setHotspots(MOCK_HOTSPOTS))
      .finally(() => setLoading(false));
  }, []);

  const emergency = hotspots.filter((h) => h.severity_level >= 4).length;
  const total = hotspots.reduce((a, h) => a + h.report_count, 0);
  const maxCount = Math.max(...hotspots.map((h) => h.report_count), 1);

  return (
    <AppShell>
      <div className="animate-in max-w-4xl">
        <PageHeader
          title="Waste Hotspots"
          subtitle="Areas with highest waste concentration in Kampala"
        />

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Hotspots",
              value: hotspots.length,
              icon: MapPin,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Critical Areas",
              value: emergency,
              icon: Flame,
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              label: "Total Reports",
              value: total,
              icon: TrendingUp,
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

        {/* Interactive Google Map */}
        <Card className="mb-8 overflow-hidden">
          <HotspotsMap hotspots={hotspots} loading={loading} />
        </Card>

        {/* Hotspot list */}
        <h3
          className="font-bold text-slate-800 mb-4"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Hotspot Rankings
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {hotspots.map((hotspot, index) => {
              const sev =
                severityConfig[hotspot.severity_level] || severityConfig[1];
              const barWidth = Math.round(
                (hotspot.report_count / maxCount) * 100,
              );
              return (
                <Card key={hotspot.$id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={14}
                            className="text-slate-400 flex-shrink-0"
                          />
                          <p className="font-semibold text-slate-800 text-sm">
                            {hotspot.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sev.bg} ${sev.color}`}
                          >
                            {sev.label}
                          </span>
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <AlertTriangle size={11} />
                            {hotspot.report_count} reports
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${sev.bar}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
