"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  Truck,
  MapPin,
  BookOpen,
  Bot,
  Mail,
  MessageSquare,
} from "lucide-react";

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/report", label: "Report", icon: AlertTriangle },
  { href: "/requests", label: "Pickup", icon: Truck },
  { href: "/hotspots", label: "Hotspots", icon: MapPin },
  { href: "/posts", label: "Feed", icon: MessageSquare },
  { href: "/education", label: "Learn", icon: BookOpen },
  { href: "/ai", label: "AI", icon: Bot },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-slate-200 shadow-lg z-40 safeArea-bottom">
      <div className="grid grid-cols-7 gap-1 px-1">
        {mobileNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-3 xs:py-4 sm:py-5 px-0.5 rounded-lg transition-all duration-200 ${
                active
                  ? "text-green-600 bg-green-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={24} className="mb-1.5 xs:mb-2" />
              <span className="text-xs font-semibold text-center truncate leading-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
