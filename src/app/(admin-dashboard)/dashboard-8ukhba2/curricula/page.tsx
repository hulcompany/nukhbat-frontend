"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GridCardSkeleton } from "@/components/ui/skeleton";
import { getTracks } from "@/api/tracks";
import { getAdminCourses } from "@/api/courses";
import { Track } from "@/types/track";
import { Subject } from "@/types/courses";

// --- Main Component logic ---
function CurriculaContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);

  const [courses, setCourses] = useState<Subject[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Read current state from URL
  const level = searchParams.get("level") || "tracks";
  const currentTrack = searchParams.get("track");
  const currentTrackName = searchParams.get("trackName");

  useEffect(() => {
    getTracks()
      .then((res) => setTracks(res.data))
      .catch((e) => setTracksError((e as Error).message))
      .finally(() => setTracksLoading(false));
  }, []);

  useEffect(() => {
    if (level !== "courses" || !currentTrack) return;
    setCoursesLoading(true);
    setCoursesError(null);
    getAdminCourses(currentTrack)
      .then((res) => setCourses(res.data))
      .catch((e) => setCoursesError((e as Error).message))
      .finally(() => setCoursesLoading(false));
  }, [level, currentTrack]);

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
      newParams.delete("trackName");
    }

    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Determine button text based on level
  // const getButtonText = () => {
  //   switch (level) {
  //     case "courses":
  //       return "إضافة مادة";
  //     default:
  //       return "إضافة مسار";
  //   }
  // };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8">
      {/* Universal Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المناهج</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium tracking-wide">
            المسار &larr; المادة
          </p>
        </div>
        {/* <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 h-11 transition-all shadow-xs shadow-blue-200">
          {getButtonText()}
          <Plus className="mr-2 h-4 w-4" />
        </Button> */}
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
              <span className="text-slate-900">
                {currentTrackName ?? currentTrack}
              </span>
            </>
          )}
        </div>
      )}

      {/* Level 1: Tracks */}
      {level === "tracks" && (
        <>
          {tracksLoading && <GridCardSkeleton />}
          {tracksError && (
            <p className="text-center text-red-500 py-12">{tracksError}</p>
          )}
          {!tracksLoading && !tracksError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {tracks.length === 0 && (
                <p className="text-center text-slate-400 col-span-3 py-12">
                  لا توجد مسارات
                </p>
              )}
              {tracks.map((track) => (
                <Card
                  key={track.id}
                  onClick={() =>
                    navigateTo("courses", {
                      track: track.id,
                      trackName: track.name,
                    })
                  }
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
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(track.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Level 2: Courses (final level) */}
      {level === "courses" && (
        <>
          {coursesLoading && <GridCardSkeleton />}
          {coursesError && (
            <p className="text-center text-red-500 py-12">{coursesError}</p>
          )}
          {!coursesLoading && !coursesError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {courses.length === 0 && (
                <p className="text-center text-slate-400 col-span-3 py-12">
                  لا توجد مواد
                </p>
              )}
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all group p-0"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100/80 transition-colors">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(course.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Next.js App Router requires Suspense for useSearchParams
export default function CurriculaPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-1 pb-8">
          <GridCardSkeleton />
        </div>
      }
    >
      <CurriculaContent />
    </Suspense>
  );
}
