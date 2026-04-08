"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { register } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input, Select } from "@/components/ui";
import {
  Leaf,
  Mail,
  Lock,
  User,
  Phone,
  Image as ImageIcon,
  X,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as "citizen" | "vendor" | "",
    contactNumber: "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePicture(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (!form.role) e.role = "Please select your role";
    if (form.role === "vendor" && !form.contactNumber.trim())
      e.contactNumber = "Contact number is required for vendors";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.role as "citizen" | "vendor",
        profilePicture || undefined,
        form.contactNumber || undefined,
      );
      await refreshUser();
      toast.success("Account created! Welcome to GoHigher 🌿");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      }}
    >
      <div className="w-full max-w-md animate-in">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-yellow-400" />
          </div>
          <span
            className="text-xl font-bold text-blue-600"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            GoHigher
          </span>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <div className="mb-8">
            <h1
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Create account
            </h1>
            <p className="text-slate-500 text-sm">
              Join the movement for a cleaner Kampala
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              placeholder="John Doe"
              icon={<User size={16} />}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              icon={<Lock size={16} />}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <Select
              label="I am a..."
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as "citizen" | "vendor" | "",
                })
              }
              options={[
                { value: "", label: "Select your role..." },
                {
                  value: "citizen",
                  label: "👤 Citizen — Report and request services",
                },
                {
                  value: "vendor",
                  label: "🛒 Vendor — Sell eco-friendly products",
                },
              ]}
              error={errors.role}
            />

            {form.role === "vendor" && (
              <Input
                label="Contact Phone Number"
                type="tel"
                placeholder="+256 xxx xxx xxx"
                icon={<Phone size={16} />}
                value={form.contactNumber}
                onChange={(e) =>
                  setForm({ ...form, contactNumber: e.target.value })
                }
                error={errors.contactNumber}
              />
            )}

            {/* Profile Picture Upload */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Profile Picture (optional)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePictureChange}
              />
              {preview ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setProfilePicture(null);
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
                  className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-500"
                >
                  <ImageIcon size={20} />
                  <span className="text-xs font-medium">
                    {profilePicture
                      ? profilePicture.name
                      : "Click to upload profile picture"}
                  </span>
                </button>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
