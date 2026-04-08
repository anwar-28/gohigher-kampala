"use client";
import { useState } from "react";
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
  MoreHorizontal,
  X,
} from "lucide-react";

const mainNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/requests", label: "Pickup", icon: Truck },
  { href: "/posts", label: "Feed", icon: MessageSquare },
  { href: "/report", label: "Report", icon: AlertTriangle },
];

const moreNavItems = [
  { href: "/hotspots", label: "Hotspots", icon: MapPin },
  { href: "/education", label: "Learn", icon: BookOpen },
  { href: "/ai", label: "AI", icon: Bot },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const renderNavLink = ({ href, label, icon: Icon }, onClick?: () => void) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={onClick}
        className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all duration-200 ${
          active
            ? "text-green-600 bg-green-50"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        <Icon size={24} className="mb-1" />
        <span className="text-xs font-semibold text-center truncate leading-tight">
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Main bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-slate-200 shadow-lg z-40 safeArea-bottom">
        <div className="grid grid-cols-5 gap-0.5 px-1">
          {mainNavItems.map((item) => renderNavLink(item))}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all duration-200 ${
              showMore
                ? "text-blue-600 bg-blue-50"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MoreHorizontal size={24} className="mb-1" />
            <span className="text-xs font-semibold text-center truncate leading-tight">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More menu modal */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-50 lg:hidden"
            onClick={() => setShowMore(false)}
          />

          {/* More menu */}
          <div className="fixed bottom-20 left-0 right-0 lg:hidden bg-white border-t border-slate-200 shadow-2xl z-50 safeArea-bottom">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">
                More Options
              </h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-0.5 p-2">
              {moreNavItems.map((item) =>
                renderNavLink(item, () => setShowMore(false)),
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
