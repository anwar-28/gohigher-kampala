"use client";
import { useState, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";
import { createReport, deleteReport, getImageUrl } from "@/lib/reports";
import { upsertHotspot } from "@/lib/services";
import {
  Button,
  Input,
  Textarea,
  Card,
  PageHeader,
  StatusBadge,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import {
  AlertTriangle,
  Plus,
  Trash2,
  MapPin,
  Camera,
  X,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function ReportPage() {
  const { user } = useAuth();
  const { reports, loading, refresh } = useReports(user?.$id);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ description: "", location: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.location.trim()) e.location = "Location is required";
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
      await createReport(
        user.$id,
        form.description,
        form.location,
        imageFile || undefined,
      );
      await upsertHotspot(form.location);
      toast.success("Report submitted successfully!");
      setForm({ description: "", location: "" });
      setPreview(null);
      setImageFile(null);
      setShowForm(false);
      refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit report",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    try {
      await deleteReport(id);
      toast.success("Report deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <AppShell>
      <div className="animate-in max-w-4xl">
        <PageHeader
          title="Waste Reports"
          subtitle="Report environmental issues in your area"
          action={
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "secondary" : "primary"}
            >
              <Plus size={16} />
              {showForm ? "Cancel" : "New Report"}
            </Button>
          }
        />

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-8 border-blue-100 animate-in">
            <h3
              className="font-bold text-slate-800 mb-5"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              File New Report
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                label="Description"
                placeholder="Describe the waste issue in detail..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                error={errors.description}
                rows={3}
              />
              <Input
                label="Location"
                placeholder="e.g. Kololo, near Shell petrol station"
                icon={<MapPin size={15} />}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                error={errors.location}
              />

              {/* Image upload */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Photo (optional)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {preview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-500"
                  >
                    <Camera size={24} />
                    <span className="text-sm font-medium">
                      Click to upload photo
                    </span>
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={submitting}>
                  Submit Report
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Reports list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card className="py-4">
            <EmptyState
              icon={<AlertTriangle size={22} />}
              title="No reports yet"
              description="Be the first to report an environmental issue in your area"
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card
                key={report.$id}
                className="p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {report.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(report.image)}
                      alt="Report"
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={22} className="text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-slate-800 text-sm line-clamp-2">
                        {report.description}
                      </p>
                      <StatusBadge status={report.status} />
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                      <MapPin size={12} />
                      <span>{report.location}</span>
                      <span className="mx-1">·</span>
                      <span>
                        {formatDistanceToNow(new Date(report.$createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(report.$id)}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
