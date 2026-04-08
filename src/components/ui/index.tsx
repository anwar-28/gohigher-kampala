"use client";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

// ─── BUTTON ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "yellow";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md":
            variant === "primary",
          "bg-slate-100 text-slate-700 hover:bg-slate-200":
            variant === "secondary",
          "text-slate-600 hover:bg-slate-100": variant === "ghost",
          "bg-red-500 text-white hover:bg-red-600": variant === "danger",
          "bg-yellow-400 text-slate-900 hover:bg-yellow-500 shadow-sm":
            variant === "yellow",
          "text-xs px-3 py-1.5": size === "sm",
          "text-sm px-4 py-2.5": size === "md",
          "text-base px-6 py-3": size === "lg",
        },
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-700">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          className={clsx(
            "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
            { "pl-10": icon, "border-red-400 focus:ring-red-400": error },
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-700">{label}</label>
      )}
      <textarea
        className={clsx(
          "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white resize-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
          { "border-red-400 focus:ring-red-400": error },
          className,
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ─── SELECT ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-700">{label}</label>
      )}
      <select
        className={clsx(
          "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-white appearance-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
          { "border-red-400 focus:ring-red-400": error },
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl border border-slate-100 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  scheduled: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
        statusStyles[status] || "bg-slate-100 text-slate-600",
      )}
    >
      {status?.replace("_", " ")}
    </span>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("bg-slate-200 animate-pulse rounded-xl", className)} />
  );
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1
          className="text-2xl font-bold text-slate-900"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
          {icon}
        </div>
      )}
      <h3
        className="font-semibold text-slate-700 mb-1"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-xs">{description}</p>
      )}
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-cyan-100 text-cyan-700",
];

export function Avatar({
  src,
  name = "User",
  size = "md",
  className,
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorByName = (fullName: string) => {
    const charCode = fullName.charCodeAt(0);
    return avatarColors[charCode % avatarColors.length];
  };

  const initials = getInitials(name);
  const colorClass = getColorByName(name);

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full font-semibold overflow-hidden flex-shrink-0",
        sizeClasses[size],
        src ? "bg-slate-100" : colorClass,
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
