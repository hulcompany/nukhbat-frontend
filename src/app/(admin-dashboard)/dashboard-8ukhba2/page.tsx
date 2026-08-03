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
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  getAdminAggregateActivity,
  getAdminAggregateSubscriptions,
} from "@/api/statistics";

// IMPORT YOUR APIS HERE (Adjust path as necessary)

export default function MainDashboardPage() {
  // --- States for Charts ---
  const [activityData, setActivityData] = useState<
    { name: string; value: number }[]
  >([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [subscriptionsData, setSubscriptionsData] = useState<
    { name: string; value: number }[]
  >([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);

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

    fetchActivity();
    fetchSubscriptions();
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
          value="6" // Note: You can hook these up to a stats API later
          icon={Users}
          iconContainerClassName="bg-blue-50 text-blue-600"
          className="relative"
        />

        <StatCard
          title="نشطون اليوم"
          value="1"
          icon={UserCheck}
          iconContainerClassName="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="المشاركون"
          value="4"
          icon={TrendingUp}
          iconContainerClassName="bg-purple-50 text-purple-600"
        />

        <StatCard
          title="حسابات محظورة"
          value="1"
          icon={Ban}
          iconContainerClassName="bg-rose-50 text-rose-600"
        />

        {/* Row 2 */}
        <StatCard
          title="مفاتيح مستخدمة"
          value="3"
          icon={Key}
          iconContainerClassName="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="مفاتيح متبقية"
          value="2"
          icon={Key}
          iconContainerClassName="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="مفاتيح منتهية"
          value="1"
          icon={Key}
          iconContainerClassName="bg-rose-50 text-rose-600"
        />

        <StatCard
          title="حسابات غير مفعلة"
          value="1"
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
    </div>
  );
}
