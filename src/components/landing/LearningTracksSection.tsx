"use client";

import React from "react";
import { BookOpen, FlaskConical, GraduationCap, Briefcase } from "lucide-react";

const tracks = [
  {
    title: "الصف التاسع",
    icon: BookOpen,
    status: "متاح الآن",
    isActive: true,
  },
  {
    title: "بكالوريا علمي",
    icon: FlaskConical,
    status: "متاح الآن",
    isActive: true,
  },
  {
    title: "بكالوريا أدبي",
    icon: GraduationCap,
    status: "متاح الآن",
    isActive: true,
  },
  {
    title: "مهني / تجارة / شريعة",
    icon: Briefcase,
    status: "قريباً",
    isActive: false,
  },
];

export function LearningTracksSection() {
  return (
    <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-16 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16 lg:mb-20">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          مسارات التعلم
        </h2>
        <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          اختر مسارك الدراسي وابدأ رحلة التفوق مع أحدث طرق التعلم المؤتمتة.
        </p>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tracks.map((track, idx) => {
          const Icon = track.icon;
          const isBlue = track.isActive;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-10 rounded-3xl transition-transform hover:-translate-y-2 duration-300 cursor-pointer ${
                isBlue
                  ? "bg-[#2563eb] shadow-lg shadow-blue-900/20"
                  : "bg-slate-600 shadow-lg shadow-black/10"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
                  isBlue
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                <Icon className="w-10 h-10" strokeWidth={2} />
              </div>

              {/* Title */}
              <h3
                className={`text-xl font-bold mb-6 text-center ${
                  isBlue ? "text-white" : "text-slate-100"
                }`}
              >
                {track.title}
              </h3>

              {/* Badge */}
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  isBlue
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {track.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
