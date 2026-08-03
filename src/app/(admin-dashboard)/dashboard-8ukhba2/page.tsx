"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, ChevronLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// API IMPORTS
import {
  getAdminAggregateActivity,
  getAdminAggregateSubscriptions,
} from "@/api/statistics";
import { downloadFile } from "@/api/files";

// TYPES IMPORTS
import { School } from "@/types/school";
import { SchoolStudent } from "@/types/student";
import { getSchools } from "@/api/schools";
import { getStudents } from "@/api/students";

// --- Helper Component for School Logo ---
function FileImage({
  fileId,
  alt,
  className,
}: {
  fileId: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string;
    downloadFile(fileId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}
// ----------------------------------------

export default function MainDashboardPage() {
  const router = useRouter();

  // --- States for Charts ---
  const [activityData, setActivityData] = useState<
    { name: string; value: number }[]
  >([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [subscriptionsData, setSubscriptionsData] = useState<
    { name: string; value: number }[]
  >([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);

  // --- States for Latest Lists ---
  const [latestSchools, setLatestSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  const [latestStudents, setLatestStudents] = useState<SchoolStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  // --- Fetch Functions ---
  useEffect(() => {
    async function fetchActivity() {
      setActivityLoading(true);
      try {
        const res = await getAdminAggregateActivity();

        // Map the week data and convert dates to Arabic day names (e.g., "الأحد", "الإثنين")
        const formattedData = res.data.week.map((item) => {
          const date = new Date(item.date);
          return {
            name: date.toLocaleDateString("ar-EG", { weekday: "long" }),
            value: item.openedStudents,
          };
        });

        setActivityData(formattedData);
      } catch (error) {
        console.error("Failed to fetch activity data", error);
      } finally {
        setActivityLoading(false);
      }
    }

    async function fetchSubscriptions() {
      setSubscriptionsLoading(true);
      try {
        const res = await getAdminAggregateSubscriptions();

        // Map data and convert dates to Arabic month names (e.g., "يناير", "فبراير")
        const formattedData = res.data.map((item: any) => {
          const date = new Date(item.date);
          return {
            name: date.toLocaleDateString("ar-EG", { month: "long" }),
            value: item.count,
          };
        });

        setSubscriptionsData(formattedData);
      } catch (error) {
        console.error("Failed to fetch subscriptions data", error);
      } finally {
        setSubscriptionsLoading(false);
      }
    }

    async function fetchLatestSchools() {
      setSchoolsLoading(true);
      try {
        // Fetch last 6 schools
        const res = await getSchools({ skip: 0, limit: 6 });
        setLatestSchools(res.data.list);
      } catch (error) {
        console.error("Failed to fetch latest schools", error);
      } finally {
        setSchoolsLoading(false);
      }
    }

    async function fetchLatestStudents() {
      setStudentsLoading(true);
      try {
        // Fetch last 6 students
        const res = await getStudents({ skip: 0, limit: 6, sort: "DESC" });
        setLatestStudents(res.data.list);
      } catch (error) {
        console.error("Failed to fetch latest students", error);
      } finally {
        setStudentsLoading(false);
      }
    }

    fetchActivity();
    fetchSubscriptions();
    fetchLatestSchools();
    fetchLatestStudents();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8">
      {/* Page Header */}
      <div className="flex flex-col items-start text-right mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          لوحة التحكم الرئيسية
        </h1>
        <p className="text-sm text-slate-500">
          مرحباً، هذه نظرة عامة على حالة المنصة اليوم
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Daily Activity */}
        <Card className="border-slate-200 shadow-xs p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-slate-900">
              نشاط الطلاب اليومي
            </CardTitle>
          </CardHeader>
          <div className="h-[250px] w-full relative" dir="ltr">
            {/* Loading Overlay */}
            {activityLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    textAlign: "right",
                  }}
                  formatter={(value: any) => [value, "طالب"]}
                />
                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Line Chart: Monthly Keys/Subscriptions */}
        <Card className="border-slate-200 shadow-xs p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-slate-900">
              استخدام المفاتيح شهرياً
            </CardTitle>
          </CardHeader>
          <div className="h-[250px] w-full relative" dir="ltr">
            {/* Loading Overlay */}
            {subscriptionsLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={subscriptionsData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    textAlign: "right",
                  }}
                  formatter={(value: any) => [value, "المفاتيح"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Latest Schools & Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Schools Card */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">
              أحدث المدارس
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => router.push("/dashboard-8ukhba2/schools")}
            >
              عرض الكل
            </Button>
          </CardHeader>
          <div className="p-4 flex flex-col gap-3">
            {schoolsLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : latestSchools.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                لا توجد مدارس مسجلة بعد
              </div>
            ) : (
              latestSchools.map((school) => (
                <div
                  key={school.id}
                  onClick={() => router.push("/dashboard-8ukhba2/schools")}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {school.logo ? (
                      <FileImage
                        fileId={school.logo}
                        alt={school.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 size={20} />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900">
                        {school.name}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        {school.owner.name}
                      </span>
                    </div>
                  </div>
                  <ChevronLeft
                    size={16}
                    className="text-slate-300 group-hover:text-blue-600 transition-colors"
                  />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Latest Students Card */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">
              أحدث الطلاب
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => router.push("/dashboard-8ukhba2/students")}
            >
              عرض الكل
            </Button>
          </CardHeader>
          <div className="p-4 flex flex-col gap-3">
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : latestStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                لا يوجد طلاب مسجلون بعد
              </div>
            ) : (
              latestStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => router.push("/dashboard-8ukhba2/students")}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {student.user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900">
                        {student.user.name}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        {student.track.name}
                      </span>
                    </div>
                  </div>
                  <ChevronLeft
                    size={16}
                    className="text-slate-300 group-hover:text-blue-600 transition-colors"
                  />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
