"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { login } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input } from "@/components/ui";
import { Leaf, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
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
      await login(form.email, form.password);
      await refreshUser();
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      }}
    >
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-blue-700" />
            </div>
            <span
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              GoHigher
            </span>
          </div>
          <h2
            className="text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Building a Cleaner,
            <br />
            Greener Kampala
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            Join thousands of citizens making a difference through waste
            reporting, clean pickup scheduling, and community action.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            ["2,400+", "Reports Filed"],
            ["1,200+", "Pickups Done"],
            ["98", "Areas Covered"],
          ].map(([val, label]) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur rounded-2xl p-4"
            >
              <p
                className="text-2xl font-bold text-yellow-400"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {val}
              </p>
              <p className="text-blue-200 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-in">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
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
                Sign in
              </h1>
              <p className="text-slate-500 text-sm">Welcome back to GoHigher</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                icon={<Lock size={16} />}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full mt-2"
              >
                Sign in
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              No account?{" "}
              <Link
                href="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
