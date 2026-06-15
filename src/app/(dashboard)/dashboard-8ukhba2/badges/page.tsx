"use client";

import React from "react";
import {
  Plus,
  Edit2,
  EyeOff,
  Eye,
  Trophy,
  Star,
  Flame,
  BookOpen,
  GraduationCap,
  Medal,
  Gem,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";

const gemRules = [
  { action: "حل سؤال صحيح", reward: "+1" },
  { action: "إنهاء وحدة", reward: "+10" },
  { action: "إنهاء تحدي يومي", reward: "+3" },
  { action: "إنهاء مادة", reward: "+50" },
];

const badges = [
  {
    id: 1,
    title: "أسبوع منتظم",
    desc: "7 أيام استمرار",
    icon: Medal,
    status: "فعال",
    gems: 5,
  },
  {
    id: 2,
    title: "محقق الإنجاز",
    desc: "إنهاء وحدة كاملة",
    icon: Star,
    status: "فعال",
    gems: 10,
  },
  {
    id: 3,
    title: "بطل التحديات",
    desc: "حل 5 تحديات يومية",
    icon: Trophy,
    status: "فعال",
    gems: 15,
  },
  {
    id: 4,
    title: "المثابر",
    desc: "30 يوم استمرار",
    icon: Flame,
    status: "فعال",
    gems: 30,
  },
  {
    id: 5,
    title: "متفوق الوحدة",
    desc: "تحقيق 100% في وحدة",
    icon: Gem,
    status: "فعال",
    gems: 20,
  },
  {
    id: 6,
    title: "مئوي الأسئلة",
    desc: "حل 100 سؤال",
    icon: BookOpen,
    status: "فعال",
    gems: 8,
  },
  {
    id: 7,
    title: "المراجع النشيط",
    desc: "مراجعة 20 سؤالاً محفوظاً",
    icon: BookOpen,
    status: "موقوف",
    gems: 6,
    disabled: true,
  },
  {
    id: 8,
    title: "منهي المادة",
    desc: "إنهاء مادة كاملة",
    icon: GraduationCap,
    status: "فعال",
    gems: 50,
  },
];

export default function BadgesPage() {
  return (
    <div className="p-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">الأوسمة والجواهر</h1>
          <p className="text-slate-500">إدارة نظام المكافآت والإنجازات</p>
        </div>

        <ActionButton
          label="إنشاء وسام"
          icon={Plus}
          bgClassName="bg-blue-500 hover:bg-blue-600 shadow-blue-200"
        />
      </div>

      {/* Gem Rules Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-bold mb-4">قواعد الجواهر</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {gemRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 border rounded-lg bg-slate-50"
              >
                <span className="text-sm">{rule.action}</span>
                <span className="font-bold text-blue-600 flex items-center gap-1">
                  {rule.reward} <Gem size={14} />
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <Card key={badge.id} className="p-5">
              <div className="flex justify-between items-start mb-1">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">{badge.title}</h3>
                    <p className="text-xs text-slate-500">{badge.desc}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full border ${badge.status === "فعال" ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                >
                  {badge.status}
                </span>
              </div>
              <div className="border-[0.01px] w-full border-slate-100" />

              <div className="flex justify-between items-center mt-1">
                <span className="text-lg font-bold text-yellow-400 flex items-center gap-1 bg-rsed-400 justify-center">
                  <Gem size={20} />
                  <p className="pt-1">{badge.gems}</p>
                </span>
                <div className="flex gap-2 text-slate-400">
                  <Edit2
                    size={16}
                    className="cursor-pointer hover:text-blue-600"
                  />
                  {badge.disabled ? (
                    <Eye size={16} className="cursor-pointer" />
                  ) : (
                    <EyeOff size={16} className="cursor-pointer" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
