"use client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card } from "@/components/ui";

const wasteData = [
  { month: "Jan", plastic: 240, organic: 180, electronic: 40 },
  { month: "Feb", plastic: 200, organic: 210, electronic: 55 },
  { month: "Mar", plastic: 280, organic: 195, electronic: 38 },
  { month: "Apr", plastic: 310, organic: 230, electronic: 62 },
  { month: "May", plastic: 275, organic: 250, electronic: 48 },
  { month: "Jun", plastic: 340, organic: 270, electronic: 71 },
];

const emissionsData = [
  { month: "Jan", co2: 1200 },
  { month: "Feb", co2: 1050 },
  { month: "Mar", co2: 980 },
  { month: "Apr", co2: 1100 },
  { month: "May", co2: 870 },
  { month: "Jun", co2: 760 },
];

const wasteTypeData = [
  { name: "Plastic", value: 38, color: "#2563EB" },
  { name: "Organic", value: 31, color: "#FACC15" },
  { name: "Electronic", value: 12, color: "#10b981" },
  { name: "Paper", value: 14, color: "#8b5cf6" },
  { name: "Other", value: 5, color: "#f43f5e" },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function WasteBarChart() {
  return (
    <Card className="p-6">
      <h3
        className="font-bold text-slate-800 mb-1"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Kampala Waste Volume (Tonnes)
      </h3>
      <p className="text-xs text-slate-400 mb-5">
        Monthly breakdown by waste type — 2024
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={wasteData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar
            dataKey="plastic"
            name="Plastic"
            fill="#2563EB"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="organic"
            name="Organic"
            fill="#FACC15"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="electronic"
            name="E-Waste"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function EmissionsLineChart() {
  return (
    <Card className="p-6">
      <h3
        className="font-bold text-slate-800 mb-1"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Carbon Emissions Trend
      </h3>
      <p className="text-xs text-slate-400 mb-5">
        CO₂ equivalent (tonnes) — GoHigher impact
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={emissionsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="co2"
            name="CO₂ (tonnes)"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function WasteTypePieChart() {
  return (
    <Card className="p-6">
      <h3
        className="font-bold text-slate-800 mb-1"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Waste Composition
      </h3>
      <p className="text-xs text-slate-400 mb-4">Kampala 2024 distribution</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={wasteTypeData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {wasteTypeData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
