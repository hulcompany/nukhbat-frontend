import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from "next/font/google";

export const metadata: Metadata = {
  title: "النخبة الأوائل",
  description: "لوحة تحكم النخبة الأوائل",
  icons: {
    icon: [
      { url: "./favicon.ico" },
      { url: "./images/logo.png", type: "image/png" },
    ],
    shortcut: "./favicon.ico",
    apple: "./images/logo.png",
  },
};

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  // Optional: define a CSS variable if you use Tailwind
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
        {children}
      </body>
    </html>
  );
}
