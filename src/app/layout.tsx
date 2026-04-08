import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "GoHigher — Kampala Sustainability Platform",
  icons: "/fav.ico",
  description:
    "Waste reporting, garbage collection, green marketplace for a cleaner Kampala.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#2563EB", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
