"use client";

import {
  Users,
  UserCheck,
  TrendingUp,
  Ban,
  Key,
  AlertCircle,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- Mock Data ---

const dailyActivityData = [
  { name: "السبت", value: 140 },
  { name: "الأحد", value: 180 },
  { name: "الإثنين", value: 210 },
  { name: "الثلاثاء", value: 190 },
  { name: "الأربعاء", value: 220 },
  { name: "الخميس", value: 170 },
  { name: "الجمعة", value: 80 },
];

const monthlyKeysData = [
  { name: "يناير", value: 45 },
  { name: "فبراير", value: 62 },
  { name: "مارس", value: 38 },
  { name: "أبريل", value: 80 },
  { name: "مايو", value: 55 },
  { name: "يونيو", value: 42 },
];

const subjectsData = [
  { name: "فيزياء", value: 30, color: "#2563eb" }, // blue-600
  { name: "إنجليزي", value: 20, color: "#0ea5e9" }, // sky-500
  { name: "عربي", value: 15, color: "#8b5cf6" }, // violet-500
  { name: "أحياء", value: 15, color: "#f43f5e" }, // rose-500
  { name: "كيمياء", value: 10, color: "#f59e0b" }, // amber-500
  { name: "رياضيات", value: 10, color: "#22c55e" }, // green-500
];

const latestStudents = [
  {
    id: 1,
    name: "محمد يوسف القاسم",
    email: "mohammad.qasem@example.com",
    avatar: "م",
    track: "الصف التاسع",
    status: "غير مشترك",
    date: "2026-05-20",
  },
  {
    id: 2,
    name: "خالد إبراهيم المصري",
    email: "khalid.masri@example.com",
    avatar: "خ",
    track: "الصف التاسع",
    status: "مشترك",
    date: "2025-11-01",
  },
  {
    id: 3,
    name: "سارة عبد الرحمن النجار",
    email: "sara.najjar@example.com",
    avatar: "س",
    track: "بكالوريا أدبي",
    status: "مشترك",
    date: "2025-10-01",
  },
  {
    id: 4,
    name: "أحمد محمد الخطيب",
    email: "ahmed.khateeb@example.com",
    avatar: "أ",
    track: "بكالوريا علمي",
    status: "مشترك",
    date: "2025-09-01",
  },
  {
    id: 5,
    name: "ليلى حسن إبراهيم",
    email: "layla.hassan@example.com",
    avatar: "ل",
    track: "بكالوريا علمي",
    status: "اشتراك منتهي",
    date: "2025-08-15",
  },
];

const supportRequests = [
  {
    id: 1,
    title: "التطبيق يتوقف فجأة",
    user: "سارة عبد الرحمن النجار",
    type: "مشكلة تقنية",
    status: "جديد",
    badge: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "إجابة السؤال غير صحيحة",
    user: "أحمد محمد الخطيب",
    type: "مشكلة في سؤال",
    status: "قيد المعالجة",
    badge: "bg-amber-100 text-amber-600",
  },
  {
    id: 3,
    title: "إضافة وضع مراجعة سريعة",
    user: "نور الدين علي",
    type: "اقتراح",
    status: "مغلق",
    badge: "bg-slate-100 text-slate-500",
  },
  {
    id: 4,
    title: "المفتاح لا يعمل",
    user: "ليلى حسن إبراهيم",
    type: "مشكلة في مفتاح التفعيل",
    status: "تم الحل",
    badge: "bg-emerald-100 text-emerald-600",
  },
];

const expiringKeys = [
  {
    id: "ELITE-2025-A1B2",
    user: "أحمد محمد الخطيب",
    date: "2027-06-01",
    status: "مستخدم",
  },
  {
    id: "ELITE-2025-C3D4",
    user: "سارة عبد الرحمن النجار",
    date: "2027-05-15",
    status: "مستخدم",
  },
  {
    id: "ELITE-2025-G7H8",
    user: "نور الدين علي",
    date: "2027-04-10",
    status: "مستخدم",
  },
];

// --- Status Badge Helper ---
const getStatusBadge = (status: string) => {
  switch (status) {
    case "مشترك":
    case "مستخدم":
      return "bg-blue-100 text-blue-600 border-blue-200";
    case "اشتراك منتهي":
      return "bg-rose-100 text-rose-600 border-rose-200";
    default:
      return "bg-slate-100 text-slate-500 border-slate-200";
  }
};

export default function MainDashboardPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
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
          value="6"
          icon={Users}
          iconContainerClassName="bg-blue-50 text-blue-600"
          className="relative"
        ></StatCard>

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
          <div className="h-[250px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyActivityData}
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
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
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
          <div className="h-[250px] w-full" dir="ltr">
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
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
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

      {/* Middle Section: Table & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Students Table */}
        <Card className="border-slate-200 shadow-xs lg:col-span-2 overflow-hidden flex flex-col">
          <CardHeader className="">
            <CardTitle className="text-lg font-bold text-slate-900">
              آخر الطلاب المسجلين
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto flex-1 p-0">
            <table className="w-full text-sm text-right">
              <thead className="text-slate-500 font-medium border-b">
                <tr>
                  <th className="px-6 py-4">الطالب</th>
                  <th className="px-6 py-4 text-center">المسار</th>
                  <th className="px-6 py-4 text-center">حالة الاشتراك</th>
                  <th className="px-6 py-4 text-center">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#16192b] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {student.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {student.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center text-slate-600 whitespace-nowrap">
                      {student.track}
                    </td>
                    <td className="px-6 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(student.status)}`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-slate-500 whitespace-nowrap">
                      {student.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pie Chart: Subjects */}
        <Card className="border-slate-200 shadow-xs p-6 lg:col-span-1">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-lg font-bold text-slate-900 text-center">
              أكثر المواد استخداماً
            </CardTitle>
          </CardHeader>
          <div
            className="h-[280px] w-full flex items-center justify-center"
            dir="ltr"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {subjectsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {subjectsData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-xs text-slate-600 font-medium">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Section: Support Requests & Expiring Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Requests List */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">
              آخر طلبات الدعم
            </CardTitle>
          </CardHeader>
          <div className="p-6 flex flex-col gap-4">
            {supportRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900">{req.title}</span>
                  <span className="text-xs text-slate-500">
                    {req.user} ·{" "}
                    <span className="text-slate-400">{req.type}</span>
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${req.badge}`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Expiring Keys List */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">
              مفاتيح قاربت على الانتهاء
            </CardTitle>
          </CardHeader>
          <div className="p-6 flex flex-col gap-4">
            {expiringKeys.map((keyData) => (
              <div
                key={keyData.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900 font-mono tracking-tight">
                    {keyData.id}
                  </span>
                  <span className="text-xs text-slate-500">
                    {keyData.user} · ينتهي:{" "}
                    <span className="text-slate-700 font-medium">
                      {keyData.date}
                    </span>
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-blue-100 text-blue-600">
                  {keyData.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
