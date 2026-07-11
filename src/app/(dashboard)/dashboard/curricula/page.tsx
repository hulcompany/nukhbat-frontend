"use client";

import React, { Suspense, useEffect, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { GridCardSkeleton } from "@/components/ui/skeleton";
import { getMySchool } from "@/api/schools";
import { Track } from "@/types/track";

// --- Mock Data ---
// const subjects = [
//   { id: 1, title: "فيزياء", unitsCount: 8, status: "فعال" },
//   { id: 2, title: "رياضيات", unitsCount: 6, status: "فعال" },
// ];

// const units = [
//   {
//     id: 1,
//     title: "النواس",
//     lessonsCount: 3,
//     questionsCount: 45,
//     condition: "إنهاء الوحدة السابقة",
//     progress: 68,
//     status: "فعال",
//   },
//   {
//     id: 2,
//     title: "الكهرباء",
//     lessonsCount: 4,
//     questionsCount: 60,
//     condition: "تحقيق 70% في النواس",
//     progress: 72,
//     status: "فعال",
//   },
// ];

// const lessons = [
//   { id: 1, title: "النواس البسيط", questionsCount: 15, status: "فعال" },
//   { id: 2, title: "النواس المرن", questionsCount: 18, status: "فعال" },
//   { id: 3, title: "النواس المخروطي", questionsCount: 12, status: "مخفي" },
// ];

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

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);

  useEffect(() => {
    setTracksLoading(true);
    setTracksError(null);
    getMySchool()
      .then((res) => setTracks(res.data.allowedTracks ?? []))
      .catch((e) => setTracksError((e as Error).message))
      .finally(() => setTracksLoading(false));
  }, []);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8">
      {/* Universal Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المناهج</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium tracking-wide">
            المسار &larr; المادة &larr; الوحدة &larr; الدرس &larr; الأسئلة
          </p>
        </div>
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
        <>
          {tracksLoading && <GridCardSkeleton />}

          {!tracksLoading && tracksError && (
            <p className="text-center text-red-500 py-16">{tracksError}</p>
          )}

          {!tracksLoading && !tracksError && tracks.length === 0 && (
            <p className="text-center text-slate-400 py-16">
              لا توجد مسارات متاحة لمدرستك
            </p>
          )}

          {!tracksLoading && !tracksError && tracks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {tracks.map((track) => (
                <Card
                  key={track.id}
                  onClick={() => router.push(`${pathname}/${track.id}`)}
                  className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group p-0"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100/80 transition-colors">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {track.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Level 2: Subjects */}
      {/* {level === "subjects" && (
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
      )} */}

      {/* Level 3: Units (List View) */}
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
