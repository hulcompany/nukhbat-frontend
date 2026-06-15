"use client";

import React from "react";
import {
  CheckSquare,
  Move,
  ListOrdered,
  PenTool,
  CheckSquare2,
} from "lucide-react";

const questionTypes = [
  {
    title: "اختيار من متعدد",
    description:
      "اختبر فهمك من خلال أسئلة متعددة الخيارات مع شرح بعد كل إجابة.",
    icon: CheckSquare,
  },
  {
    title: "سحب وإفلات",
    description:
      "اختبر فهمك من خلال أسئلة متعددة الخيارات مع شرح بعد كل إجابة.",
    icon: Move,
  },
  {
    title: "ترتيب خطوات الحل",
    description: "تدرب على التسلسل الصحيح للوصول إلى الحل خطوة بخطوة.",
    icon: ListOrdered,
  },
  {
    title: "إكمال الفراغات",
    description: "عزز استيعابك للمفاهيم الأساسية من خلال أسئلة الإكمال.",
    icon: PenTool,
  },
  {
    title: "صح و خطأ",
    description: "اختبر دقة فهمك بسرعة وراجع أخطاءك مباشرة.",
    icon: CheckSquare2,
  },
];

export function InteractiveLearningSection() {
  return (
    <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-16 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
      {/* Content Area (Right Side) */}
      <div className="flex-1 flex flex-col items-start text-right">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
          تعلم بطرق تساعدك على الفهم
          <br />
          <span className="text-white">لا الحفظ فقط</span>
        </h2>
        <p className="text-lg text-slate-300 mb-10 max-w-xl">
          تدرب على أنواع متعددة من الأسئلة التفاعلية المصممة لتعزيز الفهم وتثبيت
          المعلومات بطريقة ممتعة وفعالة.
        </p>

        {/* List of Question Types */}
        <div className="w-full flex flex-col gap-4">
          {questionTypes.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 bg-[#e2e8f0] px-6 py-4 rounded-xl hover:bg-[#cbd5e1] transition-colors duration-300 w-full md:w-[90%]"
              >
                <div className="text-[#2563eb]">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-right">
                  <h4 className="text-[#2563eb] font-bold text-lg mb-1">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 text-sm font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Area (Left Side) */}
      <div className="flex-1 w-full relative flex justify-center items-center mt-12 lg:mt-0">
        {/* Decorative Dotted Pattern (Pure CSS) */}
        <div className="absolute top-1/4 right-0 md:-right-8 w-32 h-32 bg-[radial-gradient(circle,#ffffff_3px,transparent_3px)] bg-[size:16px_16px] opacity-30 z-0 rounded-full"></div>
        <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-72 h-64 bg-blue-600/80 rounded-full blur-[100px] pointer-events-none"></div>

        {/* 
          Main Image (Pink Background) 
        */}
        <div className="relative z-10 w-[280px] md:w-[340px]">
          <img
            src="./landing/student-red.png"
            alt="طالب يدرس"
            className="w-full h-auto rounded-[2.5rem] object-cover shadow-2xl"
          />
        </div>

        {/* 
          Overlapping Image (Blue Background) 
        */}
        <div className="absolute -bottom-10 left-4 md:right-12 z-20 w-[200px] md:w-[240px]">
          <img
            src="./landing/student-blue.png"
            alt="طالب سعيد"
            className="w-full h-auto rounded-[2rem] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] "
          />
        </div>
      </div>
    </section>
  );
}
