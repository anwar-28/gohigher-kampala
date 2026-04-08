"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useRequests";
import { createGarbageRequest } from "@/lib/services";
import {
  Button,
  Input,
  Select,
  Card,
  PageHeader,
  StatusBadge,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import {
  Truck,
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock,
  RefreshCw,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";

const WASTE_TYPES = [
  { value: "", label: "Select waste type..." },
  { value: "General Household", label: "🏠 General Household Waste" },
  { value: "Plastic & Bottles", label: "♻️ Plastic & Bottles" },
  { value: "Organic / Food Waste", label: "🌿 Organic / Food Waste" },
  { value: "Electronic Waste", label: "💻 Electronic Waste" },
  { value: "Construction Debris", label: "🏗️ Construction Debris" },
  { value: "Hazardous Materials", label: "⚠️ Hazardous Materials" },
];

const statusSteps = ["pending", "scheduled", "completed"];

export default function RequestsPage() {
  const { user } = useAuth();
  const { requests, loading, refresh } = useRequests(user?.$id);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ waste_type: "", date: "", location: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.waste_type) e.waste_type = "Please select a waste type";
    if (!form.date) e.date = "Please select a date";
    if (!form.location) e.location = "Please enter your location";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      await createGarbageRequest(
        user.$id,
        form.waste_type,
        form.date,
        form.location,
      );
      toast.success("Pickup request scheduled!");
      setForm({ waste_type: "", date: "", location: "" });
      setShowForm(false);
      refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to schedule request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStepIndex = (status: string) => statusSteps.indexOf(status);

  return (
    <AppShell>
      <div className="animate-in max-w-3xl">
        <PageHeader
          title="Garbage Pickup Requests"
          subtitle="Schedule a garbage collection at your location"
          action={
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "secondary" : "primary"}
            >
              <Plus size={16} />
              {showForm ? "Cancel" : "New Request"}
            </Button>
          }
        />

        {showForm && (
          <Card className="p-6 mb-8 border-blue-100 animate-in">
            <h3
              className="font-bold text-slate-800 mb-5"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Schedule Pickup
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Waste Type"
                value={form.waste_type}
                onChange={(e) =>
                  setForm({ ...form, waste_type: e.target.value })
                }
                options={WASTE_TYPES}
                error={errors.waste_type}
              />
              <Input
                label="Location"
                type="text"
                icon={<MapPin size={15} />}
                placeholder="e.g., Kampala, Nakasero"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                error={errors.location}
              />
              <Input
                label="Preferred Pickup Date"
                type="date"
                icon={<CalendarDays size={15} />}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                error={errors.date}
                min={new Date().toISOString().split("T")[0]}
              />
              <div className="pt-2">
                <Button type="submit" loading={submitting}>
                  Schedule Pickup
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Truck size={22} />}
              title="No requests yet"
              description="Schedule your first garbage pickup"
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card
                key={req.$id}
                className="p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-base mb-1">
                        {req.waste_type}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <MapPin
                            size={14}
                            className="text-blue-500 flex-shrink-0"
                          />
                          {req.location}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <CalendarDays
                            size={14}
                            className="text-green-500 flex-shrink-0"
                          />
                          {format(new Date(req.date), "PPP")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                {/* Status tracker */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {statusSteps.map((step, i) => {
                      const current = getStepIndex(req.status);
                      const done = i <= current;
                      return (
                        <div
                          key={step}
                          className="flex items-center flex-1 last:flex-none"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors font-semibold text-sm ${
                              done
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 mx-2 last:hidden">
                            <div
                              className={`h-2 rounded-full transition-colors ${done && i < current ? "bg-gradient-to-r from-blue-500 to-blue-400" : "bg-slate-200"}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2 px-1">
                    <span>Pending</span>
                    <span>Scheduled</span>
                    <span>Completed</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
                  <RefreshCw size={12} />
                  Submitted{" "}
                  {formatDistanceToNow(new Date(req.$createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
