import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "النخبة",
  description: "لوحة تحكم النخبة",
  keywords: [
    "النخبة",
    "لوحة تحكم",
    "منصة تعليمية",
    "إدارة مدارس",
    "طلاب",
    "مناهج دراسية",
    "التعليم في سوريا",
    "nukhbat",
  ],
  icons: {
    icon: [
      { url: "./favicon.ico" },
      { url: "./images/logo.png", type: "image/png" },
    ],
    shortcut: "./favicon.ico",
    apple: "./images/logo.png",
  },
};

// Reduced the weights to prevent timeout errors during build
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} font-sans bg-[#0a0f1c]`}>
        <NextTopLoader color="#2563eb" showSpinner={false} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
