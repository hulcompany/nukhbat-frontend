"use client";

import React from "react";
import { Download } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "أنشئ حسابك وفعله",
    description: "سجل دخولك واستخدم مفتاح التفعيل الخاص بك للبدء.",
  },
  {
    num: "02",
    title: "اختر مسارك الدراسي",
    description: "حدد صفك أو فرعك لتظهر لك الوحدات والأسئلة المناسبة.",
  },
  {
    num: "03",
    title: "تدرّب وتابع تقدمك",
    description: "حل الأسئلة، راجع أخطاءك، واجمع الجواهر أثناء تقدمك",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-16 max-w-350 mx-auto">
      {/* Section Header */}
      <div className="text-center mb-20 lg:mb-32">
        <h2 className="text-4xl md:text-5xl font-black text-white">
          كيف يعمل التطبيق؟
        </h2>
      </div>

      <div className="flex flex-col gap-32 lg:gap-48">
        {/* --- Block 1: Stepper & 3 Phones --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          {/* Right Side: Stepper Content */}
          <div className="flex-1 flex flex-col items-start text-right w-full lg:max-w-md">
            <div className="flex flex-col gap-10 mb-10">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-start">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#2563eb] shadow-[0_0_12px_rgba(37,99,235,0.8)]"></div>
                    <span className="text-slate-400 font-mono text-xl">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed font-medium text-md">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button className="bg-[#2563eb] hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-md font-bold transition-all shadow-xl shadow-blue-900/30 flex items-center gap-3">
              تحميل التطبيق مباشرة
              <Download className="h-6 w-6" />
            </button>
          </div>

          {/* Left Side: Image (3 Phones) */}
          <div className="flex-1 relative flex justify-center lg:justify-end w-full">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            {/* REPLACE WITH YOUR 3-PHONES IMAGE */}
            <img
              src="./landing/phones-group-1.png"
              alt="خطوات التطبيق"
              className="relative z-10 w-full max-w-125 object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>

        {/* --- Block 2: Text Left, 2 Phones Right --- */}
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-16 lg:gap-24">
          {/* Right Side: Image (2 Phones) */}
          <div className="flex-1 relative flex justify-center lg:justify-start w-full">
            <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            {/* REPLACE WITH YOUR 2-PHONES IMAGE */}
            <img
              src="./landing/phones-mockup.png"
              alt="واجهة التطبيق"
              className="relative z-10 w-full max-w-[450px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
            />
          </div>

          {/* Left Side: Text Content */}
          <div className="flex-1 flex flex-col items-start text-right w-full lg:max-w-md">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
              أنشئ حسابك وفعله
            </h3>
            <p className="text-xl text-slate-400 leading-relaxed font-medium">
              سجل دخولك واستخدم مفتاح التفعيل الخاص بك للبدء.
            </p>
          </div>
        </div>

        {/* --- Block 3: Text Right, Tilted Phones Left --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          {/* Right Side: Text Content */}
          <div className="flex-1 flex flex-col items-start text-right w-full lg:max-w-md lg:ml-auto">
            <div className="absolute top-1/2 right-2/3 translate-x-1/2 -translate-y-1/2 w-72 h-64 bg-blue-600/40 rounded-full blur-[100px] pointer-events-none"></div>

            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
              أنشئ حسابك وفعله
            </h3>
            <p className="text-xl text-slate-400 leading-relaxed font-medium">
              سجل دخولك واستخدم مفتاح التفعيل الخاص بك للبدء.
            </p>
          </div>

          {/* Left Side: Image (Tilted Phones) */}
          <div className="flex-1 relative flex justify-center lg:justify-end w-full">
            <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            {/* REPLACE WITH YOUR TILTED PHONES IMAGE */}
            <img
              src="./landing/phones-group-3.png"
              alt="مزايا التطبيق"
              className="relative z-10 w-full max-w-[500px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
