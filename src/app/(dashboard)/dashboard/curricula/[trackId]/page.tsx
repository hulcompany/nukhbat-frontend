"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSchoolCourses } from "@/api/courses";
import { Subject } from "@/types/courses";

export default function TrackCoursesPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const router = useRouter();

  const [courses, setCourses] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSchoolCourses(trackId)
      .then((res) => setCourses(res.data))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [trackId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            {courses[0]?.track.name ?? "مواد المسار"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">مواد هذا المسار</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin ml-2" />
          جارٍ التحميل...
        </div>
      )}

      {!loading && error && (
        <p className="text-center text-red-500 py-16">{error}</p>
      )}

      {!loading && !error && courses.length === 0 && (
        <p className="text-center text-slate-400 py-16">
          لا توجد مواد لهذا المسار
        </p>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              onClick={() =>
                router.push(`/dashboard/curricula/${trackId}/${course.id}`)
              }
              className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer p-0 group"
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
                  <p className="text-sm text-slate-500 font-medium">
                    {new Date(course.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
