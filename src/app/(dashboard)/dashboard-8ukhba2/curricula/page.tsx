"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Plus,
  BookOpen,
  Edit,
  EyeOff,
  Eye,
  Unlock,
  GripVertical,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// --- Mock Data ---
const tracks = [
  { id: 1, title: "بكالوريا علمي", subjectsCount: 2, status: "فعال" },
  { id: 2, title: "بكالوريا أدبي", subjectsCount: 1, status: "فعال" },
  { id: 3, title: "الصف التاسع", subjectsCount: 0, status: "فعال" },
];

const subjects = [
  { id: 1, title: "فيزياء", unitsCount: 8, status: "فعال" },
  { id: 2, title: "رياضيات", unitsCount: 6, status: "فعال" },
];

const units = [
  {
    id: 1,
    title: "النواس",
    lessonsCount: 3,
    questionsCount: 45,
    condition: "إنهاء الوحدة السابقة",
    progress: 68,
    status: "فعال",
  },
  {
    id: 2,
    title: "الكهرباء",
    lessonsCount: 4,
    questionsCount: 60,
    condition: "تحقيق 70% في النواس",
    progress: 72,
    status: "فعال",
  },
];

const lessons = [
  { id: 1, title: "النواس البسيط", questionsCount: 15, status: "فعال" },
  { id: 2, title: "النواس المرن", questionsCount: 18, status: "فعال" },
  { id: 3, title: "النواس المخروطي", questionsCount: 12, status: "مخفي" },
];

// --- Main Component logic ---
function CurriculaContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current state from URL
  const level = searchParams.get("level") || "tracks";
  const currentTrack = searchParams.get("track");
  const currentSubject = searchParams.get("subject");
  const currentUnit = searchParams.get("unit");

  // Helper to update URL params
  const navigateTo = (
    newLevel: string,
    params: Record<string, string> = {},
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("level", newLevel);
    Object.entries(params).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    // Remove deeper levels if navigating backwards
    if (newLevel === "tracks") {
      newParams.delete("track");
      newParams.delete("subject");
      newParams.delete("unit");
    }
    if (newLevel === "subjects") {
      newParams.delete("subject");
      newParams.delete("unit");
    }
    if (newLevel === "units") {
      newParams.delete("unit");
    }

    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Determine button text based on level
  const getButtonText = () => {
    switch (level) {
      case "subjects":
        return "إضافة مادة";
      case "units":
        return "إضافة وحدة";
      case "lessons":
        return "إضافة درس";
      default:
        return "إضافة مسار";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Universal Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المناهج</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium tracking-wide">
            المسار &larr; المادة &larr; الوحدة &larr; الدرس &larr; الأسئلة
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 h-11 transition-all shadow-xs shadow-blue-200">
          {getButtonText()}
          <Plus className="mr-2 h-4 w-4" />
        </Button>
      </div>

      {/* Dynamic Breadcrumbs */}
      {level !== "tracks" && (
        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-6">
          <button
            onClick={() => navigateTo("tracks")}
            className="hover:underline"
          >
            المسارات
          </button>

          {currentTrack && (
            <>
              <ChevronLeft className="h-4 w-4 text-slate-400" />
              <button
                onClick={() => navigateTo("subjects", { track: currentTrack })}
                className={
                  level === "subjects" ? "text-slate-900" : "hover:underline"
                }
              >
                {currentTrack}
              </button>
            </>
          )}

          {currentSubject && (
            <>
              <ChevronLeft className="h-4 w-4 text-slate-400" />
              <button
                onClick={() =>
                  navigateTo("units", {
                    track: currentTrack!,
                    subject: currentSubject,
                  })
                }
                className={
                  level === "units" ? "text-slate-900" : "hover:underline"
                }
              >
                {currentSubject}
              </button>
            </>
          )}

          {currentUnit && (
            <>
              <ChevronLeft className="h-4 w-4 text-slate-400" />
              <span className="text-slate-900">{currentUnit}</span>
            </>
          )}
        </div>
      )}

      {/* Level 1: Tracks */}
      {level === "tracks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tracks.map((track) => (
            <Card
              key={track.id}
              onClick={() => navigateTo("subjects", { track: track.title })}
              className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group p-0"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100/80 transition-colors">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {track.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {track.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {track.subjectsCount} مادة
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Level 2: Subjects */}
      {level === "subjects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              onClick={() =>
                navigateTo("units", {
                  track: currentTrack!,
                  subject: subject.title,
                })
              }
              className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group p-0"
            >
              <CardContent className="p-6 flex flex-col items-start text-right">
                <div className="flex justify-between items-start w-full mb-6 flex-row">
                  <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {subject.status}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <EyeOff className="h-4 w-4 hover:text-slate-600" />
                    <Edit className="h-4 w-4 hover:text-slate-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {subject.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {subject.unitsCount} وحدة
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Level 3: Units (List View) */}
      {level === "units" && (
        <div className="flex flex-col gap-4">
          {units.map((unit) => (
            <Card
              key={unit.id}
              onClick={() =>
                navigateTo("lessons", {
                  track: currentTrack!,
                  subject: currentSubject!,
                  unit: unit.title,
                })
              }
              className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              {/* Right Side (Text & Grip) */}
              <div className="flex items-start gap-4 w-full md:w-auto">
                <GripVertical className="h-5 w-5 text-slate-300 cursor-grab mt-1 shrink-0" />
                <div className="flex flex-col text-right">
                  <h3 className="font-bold text-slate-900">{unit.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {unit.lessonsCount} درس · {unit.questionsCount} سؤال · شرط
                    الفتح: {unit.condition}
                  </p>
                </div>
              </div>

              {/* Left Side (Progress, Badge, Icons) */}
              <div className="flex flex-row-reverse md:flex-row items-center justify-between md:justify-end gap-4 md:gap-6 w-full md:w-auto border-t border-slate-50 md:border-0 pt-4 md:pt-0">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-medium text-xs w-8 text-right">
                    {unit.progress}%
                  </span>
                  <div className="w-20 sm:w-24 bg-slate-100 rounded-full h-2 flex flex-row-reverse overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${unit.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    {unit.status}
                  </span>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Edit className="h-4 w-4 hover:text-slate-600 transition-colors" />
                    <Unlock className="h-4 w-4 hover:text-slate-600 transition-colors" />
                    <EyeOff className="h-4 w-4 hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Level 4: Lessons (List View) */}
      {level === "lessons" && (
        <div className="flex flex-col gap-4">
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              {/* Right Side (Text & Grip) */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <GripVertical className="h-5 w-5 text-slate-300 cursor-grab shrink-0" />
                <div className="flex flex-col text-right">
                  <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lesson.questionsCount} سؤال
                  </p>
                </div>
              </div>

              {/* Left Side (Badge & Icons) */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-slate-50 sm:border-0 pt-3 sm:pt-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    lesson.status === "فعال"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {lesson.status}
                </span>
                <div className="flex items-center gap-4 text-slate-400">
                  <Edit className="h-4 w-4 hover:text-slate-600 transition-colors" />
                  {lesson.status === "فعال" ? (
                    <Eye className="h-4 w-4 text-blue-500 hover:text-blue-600 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 hover:text-slate-600 transition-colors" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Next.js App Router requires Suspense for useSearchParams
export default function CurriculaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">جاري التحميل...</div>
      }
    >
      <CurriculaContent />
    </Suspense>
  );
}
