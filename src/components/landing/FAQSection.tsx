"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "هل هناك جوائز حقيقية للمتصدرين؟",
    answer:
      "نعم! نحن نكافئ الطلاب المتفوقين في لوحات الترتيب بجوائز قيمة ومكافآت تشجيعية تقديراً لجهودهم.",
  },
  {
    question: "كيف يمكنني الحصول على مفتاح تفعيل؟",
    answer:
      "يمكنك الحصول على مفتاح التفعيل من خلال مراكزنا المعتمدة أو عبر التواصل مع فريق الدعم الفني لدينا.",
  },
  {
    question: "هل يعمل التطبيق بدون إنترنت؟",
    answer:
      "يحتاج التطبيق للاتصال بالإنترنت لمزامنة تقدمك والحصول على أحدث الأسئلة والنتائج.",
  },
  {
    question: "ما هي المناهج التي يغطيها التطبيق؟",
    answer:
      "يغطي التطبيق المناهج الدراسية لشهادات التاسع والبكالوريا بجميع فروعها العلمية والأدبية.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-16 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          الأسئلة الشائعة
        </h2>
        <p className="text-lg md:text-xl text-slate-400 font-medium">
          كل ما تحتاج معرفته عن تطبيق النخبة الأوائل.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-right"
            >
              <span className="text-lg font-bold text-white">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openIndex === idx ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                openIndex === idx
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
