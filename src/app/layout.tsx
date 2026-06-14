import type { Metadata } from "next";
import "./globals.css";
import { Tajawal } from "next/font/google";

export const metadata: Metadata = {
  title: "النخبة الأوائل",
  description: "لوحة تحكم النخبة الأوائل",
};

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.className} font-sans bg-[#0a0f1c]`}>
        {children}
      </body>
    </html>
  );
}
