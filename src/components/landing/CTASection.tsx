"use client";

import React from "react";
import { Download } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative z-10 py-20 px-6 lg:px-16 max-w-[1400px] mx-auto">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 p-8 md:p-16 text-center shadow-2xl">
        {/* Heading */}
        <h2 className="text-2xl md:text-5xl font-black text-[#1e293b] mb-6 leading-tight">
          اشترك الآن وابدأ رحلة <br />
          <span className="text-[#2563eb]">التفوق مع النخبة</span>
        </h2>

        {/* Subtext */}
        <p className="text-md md:text-xl text-slate-600 font-medium mb-10 max-w-2xl mx-auto">
          لست بحاجة لبطاقة ائتمان. الاشتراك يتم مباشرة عبر إدارة التطبيق الرسمية
          بكل سهولة وأمان.
        </p>

        {/* Action Button */}
        <button className="bg-[#2563eb] hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-md font-bold transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 mx-auto">
          تحميل التطبيق مباشرة
          <Download className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
