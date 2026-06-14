"use client";

import React from "react";
import { Bookmark, AlertCircle, RefreshCw } from "lucide-react";

// Feature Data specifically for this section
const reviewFeatures = [
  {
    title: "احفظ الأسئلة الصعبة",
    description: "أضف أي سؤال تحتاج مراجعته بضغطة واحدة أثناء الحل.",
    icon: Bookmark,
    variant: "blue",
  },
  {
    title: "ارجع لأخطائك",
    description: "راجع الأسئلة التي أخطأت بها وافهم أين حدث الخطأ.",
    icon: AlertCircle,
    variant: "white",
  },
  {
    title: "تدرّب حتى تتقن",
    description: "أعد حل الأسئلة الصعبة وحوّل نقاط ضعفك إلى تقدم واضح.",
    icon: RefreshCw,
    variant: "blue",
  },
];

export function ReviewSection() {
  return (
    <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-16 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16 lg:mb-20">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          راجع أخطاءك... وتقدّم بثقة
        </h2>
        <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          احفظ الأسئلة الصعبة أو الخاطئة، وارجع لها لاحقاً للتدرب عليها من جديد
          حتى تتقنها.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {reviewFeatures.map((feature, idx) => {
          const isBlue = feature.variant === "blue";
          const Icon = feature.icon;

          return (
            <div
              key={idx}
              className={`p-8 rounded-3xl flex flex-col items-start text-right transition-transform hover:-translate-y-2 duration-300 shadow-2xl ${
                isBlue
                  ? "bg-[#2563eb] shadow-blue-900/20"
                  : "bg-white shadow-black/10"
              }`}
            >
              {/* Icon Container */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${
                  isBlue
                    ? "bg-white/20 text-white" // Lighter translucent blue for the blue card's icon
                    : "bg-[#2563eb] text-white" // Solid blue for the white card's icon
                }`}
              >
                <Icon className="h-8 w-8" strokeWidth={2.5} />
              </div>

              {/* Text Content */}
              <h3
                className={`text-2xl font-bold mb-4 ${
                  isBlue ? "text-white" : "text-[#2563eb]"
                }`}
              >
                {feature.title}
              </h3>

              <p
                className={`text-base leading-relaxed font-medium ${
                  isBlue ? "text-blue-100" : "text-slate-500"
                }`}
              >
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
