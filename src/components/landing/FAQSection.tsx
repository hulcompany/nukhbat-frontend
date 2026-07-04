"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getFaqs } from "@/api/landing";
import { FaqItem } from "@/types/landing";

export function FAQSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    getFaqs()
      .then((res) => setFaqs(res.data.data))
      .catch(() => {});
  }, []);

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
            key={faq.id}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-right"
            >
              <span className="text-lg font-bold text-white">{faq.title}</span>
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
                  {faq.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
