"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { getInfo } from "@/api/landing";
import { AppInfo } from "@/types/landing";

const FIXED_EMAIL = "support.alnokhba@gmail.com";

export function Footer() {
  const [info, setInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    getInfo()
      .then((res) => setInfo(res.data.data))
      .catch(() => {});
  }, []);

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatUrl = (url: string | undefined) => {
    if (!url) return "#";
    // If it already has http or https, return it as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // Otherwise, add https:// so it acts as an absolute external link
    return `https://${url}`;
  };

  return (
    <footer
      className="bg-transparent pt-20 border-t border-slate-800/50"
      dir="rtl"
    >
      <div className="max-w-350 mx-auto px-6 lg:px-16">
        {/* --- Top Footer Content --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-right">
          {/* Column 1: Logo & App Description */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img
                src="/images/logo.webp"
                alt="شعار النُخبة"
                className="h-10 w-auto object-contain rounded-lg"
              />
              <span className="text-2xl font-black text-white tracking-tight">
                النُخبة
              </span>
            </Link>

            <p className="text-slate-400 leading-relaxed font-medium max-w-md mb-8">
              التطبيق الأول في سوريا المتخصص بأتمتة المناهج الدراسية لشهادات
              التاسع والبكالوريا بأسلوب عصري ومحفز.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {/* Google Play Button */}
              <a
                href={formatUrl(info?.googlePlay)} // Use the helper here
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row-reverse items-center gap-3 bg-transparent border border-slate-700 rounded-xl px-5 py-2.5 hover:bg-slate-800 transition-colors group"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors">
                    احصل عليه من
                  </span>
                  <span className="text-sm font-bold text-white leading-none mt-0.5">
                    Google Play
                  </span>
                </div>
                <svg
                  viewBox="0 0 512 512"
                  className="w-6 h-6 fill-current text-[#2563eb]"
                >
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={formatUrl("https://www.facebook.com/share/1BJ8HuzztG/")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فيسبوك"
                className="w-11 h-12 rounded-xl border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={formatUrl(
                  "https://www.instagram.com/alnukhba.app?igsh=MWZkbnI4a2N1ZmxrZw==",
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="انستغرام"
                className="w-11 h-12 rounded-xl border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-start lg:items-center">
            <div className="text-right">
              <h4 className="text-white font-bold text-lg mb-6">روابط سريعة</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#home"
                    onClick={(e) => handleScroll(e, "#home")}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    القائمة الرئيسية
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    onClick={(e) => handleScroll(e, "#features")}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    المميزات
                  </Link>
                </li>
                <li>
                  <Link
                    href="#tracks"
                    onClick={(e) => handleScroll(e, "#tracks")}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    المسارات
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    onClick={(e) => handleScroll(e, "#faq")}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    الأسئلة الشائعة
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col items-start lg:items-end">
            <div className="text-right">
              <h4 className="text-white font-bold text-lg mb-6">تواصل معنا</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#2563eb]" />
                  <span className="text-slate-400" dir="ltr">
                    {info?.phone || "+963 9X XXX XXXX"}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#2563eb]" />
                  <span className="text-slate-400" dir="ltr">
                    {FIXED_EMAIL}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#2563eb]" />
                  <span className="text-slate-400">
                    {info?.location || "سوريا"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- Bottom Footer Bar --- */}
        <div className="border-t border-slate-800/50 mt-16 py-8 flex flex-col items-center justify-center gap-3 text-sm text-slate-500">
          <p>
            تم التطوير بواسطة{" "}
            <a
              href="https://hul-co.com/"
              className="text-slate-300 underline underline-offset-4 hover:text-white transition-colors"
            >
              شركة حَل
            </a>
          </p>
          <p>جميع الحقوق محفوظة © 2026 تطبيق النُخبة .</p>
        </div>
      </div>
    </footer>
  );
}
