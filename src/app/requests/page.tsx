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
  const [form, setForm] = useState({ waste_type: "", date: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.waste_type) e.waste_type = "Please select a waste type";
    if (!form.date) e.date = "Please select a date";
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
      await createGarbageRequest(user.$id, form.waste_type, form.date);
      toast.success("Pickup request scheduled!");
      setForm({ waste_type: "", date: "" });
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
              <Card key={req.$id} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {req.waste_type}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <CalendarDays size={11} />
                        {format(new Date(req.date), "PPP")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                {/* Status tracker */}
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
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            done ? "bg-blue-600" : "bg-slate-200"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 size={14} className="text-white" />
                          ) : (
                            <Clock size={12} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 mx-2 last:hidden">
                          <div
                            className={`h-1 rounded-full transition-colors ${done && i < current ? "bg-blue-600" : "bg-slate-200"}`}
                          />
                        </div>
                        {i === statusSteps.length - 1 && (
                          <span className="text-xs text-slate-500 ml-1 capitalize">
                            {step}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1 px-0.5">
                  <span>Pending</span>
                  <span>Scheduled</span>
                  <span>Completed</span>
                </div>

                <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                  <RefreshCw size={11} />
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
