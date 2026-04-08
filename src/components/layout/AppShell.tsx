"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"
            style={{ borderWidth: 3 }}
          />
          <p
            className="text-blue-600 font-medium"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Loading GoHigher...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="w-full lg:ml-64 flex-1 p-4 md:p-6 lg:p-8 min-h-screen pb-24 lg:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
