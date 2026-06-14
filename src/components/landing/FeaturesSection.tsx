"use client";

import React from "react";
import {
  BookOpen,
  Lightbulb,
  Bookmark,
  BarChart3,
  Target,
  Trophy,
} from "lucide-react";

// Feature Data
const features = [
  {
    title: "أسئلة مؤتمتة",
    description: "تدرب على أسئلة متنوعة تغطي المنهاج وتساعدك على ترسيخ فهمك.",
    icon: BookOpen,
    variant: "blue",
  },
  {
    title: "شرح وتلميحات ذكية",
    description:
      "احصل على تلميحات وشرح يساعدك على فهم الإجابة والتعلم من أخطائك.",
    icon: Lightbulb,
    variant: "white",
  },
  {
    title: "مراجعة الأسئلة الصعبة",
    description: "احفظ الأسئلة التي تحتاج لمراجعتها وارجع إليها في أي وقت.",
    icon: Bookmark,
    variant: "blue",
  },
  {
    title: "متابعة التقدم",
    description: "راقب أداءك واكتشف نقاط القوة والضعف من خلال إحصائيات واضحة.",
    icon: BarChart3,
    variant: "white",
  },
  {
    title: "خطة تعلم منظمة",
    description: "اتبع مساراً دراسياً واضحاً يساعدك على تحقيق أفضل النتائج.",
    icon: Target,
    variant: "blue",
  },
  {
    title: "منافسة وجوائز",
    description: "اجمع الجواهر والأوسمة وتقدم في ترتيب الطلاب المتفوقين.",
    icon: Trophy,
    variant: "white",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-16 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16 lg:mb-20">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          لماذا النخبة الأوائل؟
        </h2>
        <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto">
          صممنا التطبيق ليكون أكثر من مجرد بنك أسئلة، إنه رفيقك الذكي نحو
          العلامة التامة.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, idx) => {
          const isBlue = feature.variant === "blue";
          const Icon = feature.icon;

          return (
            <div
              key={idx}
              className={`p-8 rounded-[2rem] flex flex-col items-start text-right transition-transform hover:-translate-y-2 duration-300 shadow-2xl ${
                isBlue
                  ? "bg-[#2563eb] shadow-blue-900/20"
                  : "bg-white shadow-black/10"
              }`}
            >
              {/* Icon Container */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${
                  isBlue
                    ? "bg-white text-[#2563eb]"
                    : "bg-[#2563eb] text-white shadow-blue-600/30"
                }`}
              >
                <Icon className="h-8 w-8" strokeWidth={2} />
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
