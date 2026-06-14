"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
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

  return (
    <footer
      className="bg-transparent pt-20 border-t border-slate-800/50"
      dir="rtl"
    >
      <div className="max-w-350 mx-auto px-6 lg:px-16">
        {/* --- Top Footer Content --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-right">
          {/* Column 1: Logo & App Description (Spans 2 columns on Desktop for breathing room) */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#2563eb] rounded-full flex items-center justify-center text-white font-bold text-xl">
                ن
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                النخبة الأوائل
              </span>
            </Link>

            <p className="text-slate-400 leading-relaxed font-medium max-w-md mb-8">
              التطبيق الأول في سوريا المتخصص بأتمتة المناهج الدراسية لشهادات
              التاسع والبكالوريا بأسلوب عصري ومحفز.
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Google Play Button */}
              <button className="flex flex-row-reverse items-center gap-3 bg-transparent border border-slate-700 rounded-xl px-5 py-2.5 hover:bg-slate-800 transition-colors group">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors">
                    احصل عليه من
                  </span>
                  <span className="text-sm font-bold text-white leading-none mt-0.5">
                    Google Play
                  </span>
                </div>
                {/* Google Play SVG Icon */}
                <svg
                  viewBox="0 0 512 512"
                  className="w-6 h-6 fill-current text-[#2563eb]"
                >
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
              </button>

              {/* App Store Button */}
              <button className="flex flex-row-reverse items-center gap-3 bg-transparent border border-slate-700 rounded-xl px-5 py-2.5 hover:bg-slate-800 transition-colors group">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors">
                    حمله من
                  </span>
                  <span className="text-sm font-bold text-white leading-none mt-0.5">
                    App Store
                  </span>
                </div>
                {/* Apple SVG Icon */}
                <svg
                  viewBox="0 0 384 512"
                  className="w-6 h-6 fill-current text-white"
                >
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
              </button>
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
                    +963 9X XXX XXXX
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#2563eb]" />
                  <span className="text-slate-400" dir="ltr">
                    support@elite-first.com
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#2563eb]" />
                  <span className="text-slate-400">
                    سوريا - دمشق - شارع الثورة
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
              شركة حل
            </a>
          </p>
          <p>جميع الحقوق محفوظة © 2026 تطبيق النخبة الأوائل.</p>
        </div>
      </div>
    </footer>
  );
}
