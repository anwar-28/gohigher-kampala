"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  AlertTriangle,
  Truck,
  MapPin,
  ShoppingBag,
  BookOpen,
  Bot,
  Mail,
  Shield,
  LogOut,
  Leaf,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/report", label: "Report Issue", icon: AlertTriangle },
  { href: "/requests", label: "Garbage Pickup", icon: Truck },
  { href: "/hotspots", label: "Hotspots", icon: MapPin },
  { href: "/marketplace", label: "Sustainability", icon: ShoppingBag },
  { href: "/education", label: "Education", icon: BookOpen },
  { href: "/ai", label: "AI Assistant", icon: Bot },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 shadow-sm z-40 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-yellow-400" />
          </div>
          <span
            className="text-xl font-bold text-blue-600"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            GoHigher
          </span>
        </Link>
      </div>

      {/* User pill */}
      {user && (
        <div className="mx-4 my-3 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user.name}
            </p>
            <p className="text-xs text-blue-600 capitalize font-medium">
              {user.role}
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                active
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
                size={18}
              />
              <span>{label}</span>
              {active && (
                <ChevronRight className="ml-auto w-3.5 h-3.5 text-blue-400" />
              )}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
              pathname === "/admin"
                ? "bg-yellow-50 text-yellow-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Shield
              size={18}
              className={
                pathname === "/admin"
                  ? "text-yellow-600"
                  : "text-slate-400 group-hover:text-slate-600"
              }
            />
            <span>Admin Panel</span>
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
