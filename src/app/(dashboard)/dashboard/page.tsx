"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  TrendingUp,
  Ban,
  Key,
  AlertCircle,
  Loader2,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/StatCard";
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
import { getSchoolAttempts } from "@/api/attempts";
import { getSchoolLeaderboard } from "@/api/leaderboard";
import { getTracks } from "@/api/tracks";
import { Attempt } from "@/types/attempt";
import { LeaderboardEntry } from "@/types/leaderboard";
import { Track } from "@/types/track";
import { ApiError } from "@/lib/errors";
import { SchoolStatisticsData } from "@/types/statistics";
import {
  getSchoolAggregateActivity,
  getSchoolAggregateSubscriptions,
  getSchoolStatistics,
} from "@/api/statistics";

function formatError(e: unknown): string {
  if (e instanceof ApiError && e.code === "BAD_INPUT" && e.serverMessage) {
    return e.serverMessage;
  }
  return (e as Error).message;
}

export default function MainDashboardPage() {
  const [stats, setStats] = useState<SchoolStatisticsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityData, setActivityData] = useState<
    { name: string; value: number }[]
  >([]);
  const [monthlyKeysData, setMonthlyKeysData] = useState<
    { name: string; value: number }[]
  >([]);
  const [monthlyKeysLoading, setMonthlyKeysLoading] = useState(true);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [leaderboardTrack, setLeaderboardTrack] = useState<Track | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const res = await getSchoolStatistics();
      setStats(res.data);
    } catch (e) {
      console.error("Failed to fetch stats", e);
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchMonthlySubscriptions() {
    setMonthlyKeysLoading(true);
    try {
      const res = await getSchoolAggregateSubscriptions();

      // Transform API data to match Recharts expected format and translate months to Arabic
      const formattedData = res.data.map((item) => {
        const date = new Date(item.date);
        return {
          // Formats "2026-01-01" to "يناير"
          name: date.toLocaleDateString("ar-EG", { month: "long" }),
          value: item.count,
        };
      });

      setMonthlyKeysData(formattedData);
    } catch (e) {
      console.error("Failed to fetch monthly subscriptions", e);
    } finally {
      setMonthlyKeysLoading(false);
    }
  }

  async function fetchAttempts() {
    setAttemptsLoading(true);
    setAttemptsError(null);
    try {
      const res = await getSchoolAttempts({ skip: 0, limit: 6, sort: "DESC" });
      setAttempts(res.data.list);
    } catch (e) {
      setAttemptsError(formatError(e));
    } finally {
      setAttemptsLoading(false);
    }
  }

  async function fetchLeaderboardPreview() {
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      const tracksRes = await getTracks();
      const track = tracksRes.data[0] ?? null;
      setLeaderboardTrack(track);
      if (!track) {
        setLeaderboard([]);
        return;
      }
      const res = await getSchoolLeaderboard(track.id, {
        skip: 0,
        limit: 6,
        sort: "DESC",
      });
      setLeaderboard(res.data.list);
    } catch (e) {
      setLeaderboardError(formatError(e));
    } finally {
      setLeaderboardLoading(false);
    }
  }

  async function fetchActivity() {
    setActivityLoading(true);
    try {
      const res = await getSchoolAggregateActivity();

      // Map the week array and parse date to Arabic weekday (e.g., السبت, الأحد)
      const formattedData = res.data.week.map((item) => {
        const dateObj = new Date(item.date);
        return {
          name: dateObj.toLocaleDateString("ar-EG", { weekday: "long" }),
          value: item.openedStudents,
        };
      });

      setActivityData(formattedData);
    } catch (error) {
      console.error("Failed to fetch admin activity data", error);
    } finally {
      setActivityLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    fetchAttempts();
    fetchLeaderboardPreview();
    fetchActivity();
    fetchMonthlySubscriptions();
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

      {/* Stats Grid - 2 Rows of 4 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 */}
        <StatCard
          title="إجمالي الطلاب"
          value={
            statsLoading ? "..." : (stats?.totalStudents?.toString() ?? "0")
          }
          icon={Users}
          iconContainerClassName="bg-blue-50 text-blue-600"
          className="relative"
        />

        <StatCard
          title="نشطون اليوم"
          value={
            statsLoading
              ? "..."
              : (stats?.openedTodayStudents?.toString() ?? "0")
          }
          icon={UserCheck}
          iconContainerClassName="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="المشاركون"
          value={
            statsLoading ? "..." : (stats?.activeStudents?.toString() ?? "0")
          }
          icon={TrendingUp}
          iconContainerClassName="bg-purple-50 text-purple-600"
        />

        <StatCard
          title="حسابات محظورة"
          value={
            statsLoading ? "..." : (stats?.blockedStudents?.toString() ?? "0")
          }
          icon={Ban}
          iconContainerClassName="bg-rose-50 text-rose-600"
        />

        {/* Row 2 */}
        <StatCard
          title="مفاتيح مستخدمة"
          value={
            statsLoading
              ? "..."
              : (stats?.activeSubscriptions?.toString() ?? "0")
          }
          icon={Key}
          iconContainerClassName="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="مفاتيح متبقية"
          value={statsLoading ? "..." : (stats?.unusedKeys?.toString() ?? "0")}
          icon={Key}
          iconContainerClassName="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="مفاتيح منتهية"
          value={
            statsLoading
              ? "..."
              : (stats?.expiredSubscriptions?.toString() ?? "0")
          }
          icon={Key}
          iconContainerClassName="bg-rose-50 text-rose-600"
        />

        <StatCard
          title="حسابات غير مفعلة"
          value={
            statsLoading
              ? "..."
              : (stats?.notOpenedTodayStudents?.toString() ?? "0")
          }
          icon={AlertCircle}
          iconContainerClassName="bg-amber-50 text-amber-600"
        />
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
                  allowDecimals={false} // Prevents showing decimals like 1.5 students
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

        {/* Line Chart: Monthly Keys */}
        <Card className="border-slate-200 shadow-xs p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-slate-900">
              استخدام المفاتيح شهرياً
            </CardTitle>
          </CardHeader>
          <div className="h-[250px] w-full relative" dir="ltr">
            {/* Loading Overlay */}
            {monthlyKeysLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyKeysData}
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
                  allowDecimals={false} // Add this so keys aren't shown as 1.5, 2.5 on the axis
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

      {/* Bottom Section: Recent Attempts & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attempts List */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">
              آخر المحاولات
            </CardTitle>
          </CardHeader>
          <div className="p-6 flex flex-col gap-4">
            {attemptsLoading && (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 size={20} className="animate-spin ml-2" />
                جارٍ التحميل...
              </div>
            )}

            {!attemptsLoading && attemptsError && (
              <p className="text-sm text-red-500 text-center py-6">
                {attemptsError}
              </p>
            )}

            {!attemptsLoading && !attemptsError && attempts.length === 0 && (
              <EmptyState title="لا توجد محاولات بعد" />
            )}

            {!attemptsLoading &&
              !attemptsError &&
              attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-900">
                      {attempt.lessonTitle}
                    </span>
                    <span className="text-xs text-slate-500">
                      {attempt.student.user.name} ·{" "}
                      <span className="text-slate-400">
                        {attempt.course.title}
                      </span>
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-emerald-100 text-emerald-600">
                    {attempt.questionsCorrect}/{attempt.questionsTotal}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        {/* Leaderboard Preview */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>المتصدرون</span>
              {leaderboardTrack && (
                <span className="text-xs font-medium text-slate-400">
                  {leaderboardTrack.name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <div className="p-6 flex flex-col gap-4">
            {leaderboardLoading && (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 size={20} className="animate-spin ml-2" />
                جارٍ التحميل...
              </div>
            )}

            {!leaderboardLoading && leaderboardError && (
              <p className="text-sm text-red-500 text-center py-6">
                {leaderboardError}
              </p>
            )}

            {!leaderboardLoading &&
              !leaderboardError &&
              leaderboard.length === 0 && (
                <EmptyState title="لا يوجد متصدرون بعد" />
              )}

            {!leaderboardLoading &&
              !leaderboardError &&
              leaderboard.map((entry, idx) => (
                <div
                  key={entry.studentId}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#16192b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-slate-900">
                      {entry.student.user.name}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-amber-100 text-amber-600">
                    {entry.xp}
                    <Zap className="h-3.5 w-3.5 fill-amber-600" />
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
