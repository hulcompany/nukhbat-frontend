"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Smooth scroll helper for better control if native behavior isn't smooth enough
  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className="absolute top-0 mx-auto left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 py-8 max-w-[1400px]"
      dir="rtl"
    >
      {/* Action Button (Now on the far right) - Hidden on mobile, shown in menu */}
      <div className="shrink-0 hidden lg:block">
        <button className="bg-[#2563eb] hover:bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20">
          تحميل التطبيق
        </button>
      </div>

      {/* Links (Center) */}
      <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
        <Link
          href="#home"
          onClick={(e) => handleScroll(e, "#home")}
          className="hover:text-white transition-colors"
        >
          الرئيسية
        </Link>
        <Link
          href="#features"
          onClick={(e) => handleScroll(e, "#features")}
          className="hover:text-white transition-colors"
        >
          المميزات
        </Link>
        <Link
          href="#question-types"
          onClick={(e) => handleScroll(e, "#question-types")}
          className="hover:text-white transition-colors"
        >
          أنواع الأسئلة
        </Link>
        <Link
          href="#tracks"
          onClick={(e) => handleScroll(e, "#tracks")}
          className="hover:text-white transition-colors"
        >
          المسارات
        </Link>
        <Link
          href="#faq"
          onClick={(e) => handleScroll(e, "#faq")}
          className="hover:text-white transition-colors"
        >
          الأسئلة الشائعة
        </Link>
      </div>

      {/* Logo (Far Left) */}
      <div className="flex items-center shrink-0">
        <Link
          href="/"
          className="text-2xl font-black text-white tracking-tight"
        >
          النخبة الأوائل
        </Link>
      </div>

      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden flex items-center order-first">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-4 right-4 mt-2 bg-[#0e172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl lg:hidden flex flex-col gap-6 z-50"
          >
            <div className="flex flex-col gap-4 text-center text-slate-300 font-medium">
              <Link
                href="#home"
                className="hover:text-white transition-colors py-2 border-b border-white/5"
                onClick={(e) => handleScroll(e, "#home")}
              >
                الرئيسية
              </Link>
              <Link
                href="#features"
                className="hover:text-white transition-colors py-2 border-b border-white/5"
                onClick={(e) => handleScroll(e, "#features")}
              >
                المميزات
              </Link>
              <Link
                href="#question-types"
                className="hover:text-white transition-colors py-2 border-b border-white/5"
                onClick={(e) => handleScroll(e, "#question-types")}
              >
                أنواع الأسئلة
              </Link>
              <Link
                href="#tracks"
                className="hover:text-white transition-colors py-2 border-b border-white/5"
                onClick={(e) => handleScroll(e, "#tracks")}
              >
                المسارات
              </Link>
              <Link
                href="#faq"
                className="hover:text-white transition-colors py-2 border-b border-white/5"
                onClick={(e) => handleScroll(e, "#faq")}
              >
                الأسئلة الشائعة
              </Link>
            </div>

            <button className="w-full bg-[#2563eb] hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all shadow-lg shadow-blue-900/20 md:hidden">
              تحميل التطبيق
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
