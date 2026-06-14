"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Map,
  Image as ImageIcon,
  BookOpen,
  Calculator,
  ListOrdered,
  Move,
  Eye,
  Layers,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// --- Mock Data for Question Types ---
const questionTypes = [
  {
    id: "map",
    title: "سؤال خريطة",
    icon: Map,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "image",
    title: "صورة تفاعلية",
    icon: ImageIcon,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "poem",
    title: "سؤال قصيدة",
    icon: BookOpen,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "equation",
    title: "سؤال معادلة",
    icon: Calculator,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "steps",
    title: "سؤال خطوات",
    icon: ListOrdered,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    id: "drag",
    title: "سحب وإفلات",
    icon: Move,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
];

function InteractiveEditorContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current selected type from URL
  const selectedTypeId = searchParams.get("type");
  const activeType = questionTypes.find((t) => t.id === selectedTypeId);

  // Helper to navigate
  const selectType = (typeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", typeId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const goBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-8">
      {/* Universal Page Header */}
      <div className="flex flex-col items-start text-right">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          محرر الأسئلة التفاعلية
        </h1>
        <p className="text-sm text-slate-500">
          إنشاء وتصميم أسئلة تفاعلية متقدمة
        </p>
      </div>

      {/* Level 1: Selection Grid */}
      {!selectedTypeId && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <p className="text-sm font-medium text-slate-600">
            اختر نوع السؤال التفاعلي الذي تريد إنشاءه:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  onClick={() => selectType(type.id)}
                  className="border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group py-8"
                >
                  <CardContent className="flex flex-col items-center justify-center p-0 gap-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${type.bg} ${type.color}`}
                    >
                      <Icon className="h-8 w-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {type.title}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Level 2: Editor Interface */}
      {selectedTypeId && activeType && (
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Column 1 (Right): Settings Panel */}
          <Card className="border-slate-200 shadow-sm md:col-span-5 lg:col-span-3 flex flex-col min-h-[500px] lg:h-[calc(100vh-140px)]">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeType.bg} ${activeType.color}`}
              >
                <activeType.icon className="h-5 w-5" />
              </div>
              <h2 className="font-bold text-slate-900 text-lg">
                {activeType.title}
              </h2>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-5 overflow-y-auto">
              {/* Question Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  نص السؤال
                </label>
                <textarea
                  className="w-full min-h-[120px] p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="أدخل نص السؤال..."
                ></textarea>
              </div>

              {/* Hint */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  التلميح
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  الشرح
                </label>
                <textarea className="w-full min-h-[120px] p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>
            </CardContent>

            {/* Action Buttons */}
            <div className="p-4 border-t border-slate-100 flex gap-3">
              <Button
                onClick={goBack}
                variant="outline"
                className="flex-1 rounded-md border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                رجوع
              </Button>
              <Button className="flex-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">
                <Save className="ml-2 h-4 w-4" />
                حفظ
              </Button>
            </div>
          </Card>

          {/* Column 2 (Middle): Design Area */}
          <Card className="border-slate-200 shadow-sm md:col-span-7 lg:col-span-6 flex flex-col min-h-[500px] lg:h-[calc(100vh-140px)]">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row justify-between items-center">
              <h2 className="font-bold text-slate-900">منطقة التصميم</h2>
              <Button
                variant="secondary"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 h-9 text-xs font-bold"
              >
                معاينة
                <Eye className="mr-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <div className="w-full h-full min-h-[400px] bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center">
                <Layers
                  className="h-12 w-12 text-slate-300 mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="text-slate-400 font-bold mb-1">
                  منطقة التصميم التفاعلية
                </h3>
                <p className="text-slate-400 text-sm">
                  استخدم لوحة الإعدادات على اليمين للبدء
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Column 3 (Left): App Preview */}
          <Card className="border-slate-200 shadow-sm md:col-span-12 lg:col-span-3 flex flex-col min-h-[600px] lg:h-[calc(100vh-140px)] bg-slate-50/50">
            <CardHeader className="p-4 flex flex-row justify-center items-center">
              <h2 className="font-bold text-slate-500 text-sm">
                معاينة التطبيق
              </h2>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex items-center justify-center">
              {/* Mobile Phone Mockup */}
              <div className="w-[280px] h-[580px] bg-white border-[14px] border-[#1e1e2d] rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col p-4 shrink-0">
                {/* Phone Notch/Dynamic Island placeholder */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1e1e2d] rounded-b-xl"></div>

                {/* Simulated App Content */}
                <div className="mt-8 bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-center min-h-[80px]">
                  <p className="text-slate-500 text-xs font-medium">
                    سيظهر نص السؤال هنا
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Wrap in Suspense because of useSearchParams
export default function InteractiveEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">جاري التحميل...</div>
      }
    >
      <InteractiveEditorContent />
    </Suspense>
  );
}
