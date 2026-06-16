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
    <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-16 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
      {/* Content Area (Right Side) */}
      <div className="flex-1 flex flex-col items-start text-right w-full">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          تعلم بطرق تساعدك على الفهم
          <br />
          <span className="text-white">لا الحفظ فقط</span>
        </h2>
        <p className="text-base md:text-lg text-slate-300 mb-10 max-w-xl font-medium">
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
                className="flex items-center gap-4 bg-slate-100/10 backdrop-blur-sm border border-white/5 hover:bg-slate-100/20 px-5 md:px-6 py-4 rounded-2xl transition-all duration-300 w-full lg:w-[90%] group"
              >
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-right">
                  <h4 className="text-white font-bold text-base md:text-lg mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Area (Left Side) */}
      <div className="flex-1 w-full relative flex justify-center items-center mt-20 lg:mt-0">
        {/* Decorative Dotted Pattern (Pure CSS) */}
        <div className="absolute top-1/4 right-0 md:-right-8 w-32 h-32 bg-[radial-gradient(circle,#ffffff_3px,transparent_3px)] bg-[size:16px_16px] opacity-20 z-0 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md aspect-square bg-blue-600/30 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Main Image */}
        <div className="relative z-10 w-[70%] sm:w-[300px] md:w-[340px] aspect-[4/5]">
          <img
            src="./landing/student-red.png"
            alt="طالب يدرس"
            className="w-full h-full rounded-[2rem] md:rounded-[3rem] object-cover shadow-2xl border-4 border-white/5"
          />
        </div>

        {/* Overlapping Image */}
        <div className="absolute -bottom-10 -left-4 sm:left-4 lg:-left-12 z-20 w-[55%] sm:w-[220px] md:w-[260px] aspect-square">
          <img
            src="./landing/student-blue.png"
            alt="طالب سعيد"
            className="w-full h-full rounded-[1.5rem] md:rounded-[2.5rem] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10"
          />
        </div>
      </div>
    </section>
  );
}
