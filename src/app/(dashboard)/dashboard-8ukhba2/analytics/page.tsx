"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

// Dashboard Data
const dailyActive = [
  { name: "السبت", v: 140 },
  { name: "الأحد", v: 180 },
  { name: "الإثنين", v: 210 },
  { name: "الثلاثاء", v: 190 },
  { name: "الأربعاء", v: 220 },
  { name: "الخميس", v: 170 },
  { name: "الجمعة", v: 80 },
];
const subjectData = [
  { n: "فيزياء", v: 27, c: "#3b82f6" }, // Blue
  { n: "إنجليزي", v: 12, c: "#38bdf8" }, // Light Blue
  { n: "عربي", v: 17, c: "#8b5cf6" }, // Purple
  { n: "أحياء", v: 9, c: "#ef4444" }, // Red
  { n: "كيمياء", v: 14, c: "#f59e0b" }, // Orange/Yellow
  { n: "رياضيات", v: 22, c: "#4ade80" }, // Green
];
const retentionData = [
  { n: "الأسبوع 1", v: 95 },
  { n: "الأسبوع 2", v: 88 },
  { n: "الأسبوع 3", v: 82 },
  { n: "الأسبوع 4", v: 78 },
  { n: "الأسبوع 5", v: 75 },
  { n: "الأسبوع 6", v: 70 },
];
const difficultyData = [
  { n: "الوحدة 1", v: 70 },
  { n: "الوحدة 2", v: 65 },
  { n: "الوحدة 3", v: 55 },
  { n: "الوحدة 4", v: 52 },
  { n: "الوحدة 5", v: 48 },
];
const dailyPerformance = [
  { n: "الأحد", v: 70 },
  { n: "الإثنين", v: 65 },
  { n: "الثلاثاء", v: 80 },
  { n: "الأربعاء", v: 68 },
  { n: "الخميس", v: 55 },
];
const monthlyKeys = [
  { n: "يناير", v: 45 },
  { n: "فبراير", v: 62 },
  { n: "مارس", v: 38 },
  { n: "أبريل", v: 80 },
  { n: "مايو", v: 55 },
  { n: "يونيو", v: 42 },
];

export default function AnalyticsDashboard() {
  return (
    <div className="p-8 space-y-6" dir="rtl">
      {/* 1. Header (Tab Switcher) */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">الإحصائيات والتحليلات</h1>
          <p className="text-slate-500">تحليلات شاملة لأداء المنصة</p>
        </div>
        <div className="flex items-center gap-2">
          {["اليوم", "الأسبوع", "الشهر", "السنة"].map((tab) => (
            <button
              key={tab}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === "الأسبوع"
                  ? "bg-slate-900 text-white shadow-md" // Dark background for active tab
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200" // Light background for inactive tabs
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 8 Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Card 1: Pie Chart */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-bold text-lg text-slate-800 mb-1">
                أكثر المواد استخداماً
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                توزيع الاستخدام بين المواد
              </p>
            </div>

            <ResponsiveContainer height={220} width="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={subjectData}
                  dataKey="v"
                  nameKey="n"
                  outerRadius={75} // Controls the size of the pie
                  stroke="#ffffff" // White borders between slices
                  strokeWidth={2}
                  labelLine={false} // Hides the lines connecting to labels
                  // Custom label to match text color to the slice color
                  label={({
                    cx,
                    cy,
                    midAngle = 0,
                    outerRadius = 0,
                    value,
                    name,
                    fill,
                  }: any) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 20;
                    // midAngle is now guaranteed to be a number, so -midAngle is safe
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={fill}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight={500}
                      >
                        {name} %{value}
                      </text>
                    );
                  }}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.c} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card 2: Bar Chart */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="mb-8">
              <h3 className="font-bold text-lg text-slate-800 mb-1">
                عدد الطلاب النشطين يومياً
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                نشاط الطلاب خلال الأسبوع الحالي
              </p>
            </div>

            <ResponsiveContainer height={220} width="100%">
              <BarChart
                data={dailyActive}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                {/* Full grid background */}
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                {/* X Axis */}
                {/* X Axis */}
                <XAxis
                  dataKey="name" // <--- Change this from "n" to "name"
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  tickMargin={10}
                />

                {/* Y Axis: Exact intervals from image */}
                <YAxis
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  domain={[0, 220]}
                  ticks={[0, 55, 110, 165, 220]}
                />

                <Bar
                  dataKey="v"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card 3: Line Chart */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="mb-8">
              <h3 className="font-bold text-lg text-slate-800 mb-1">
                معدل الاحتفاظ بالطلاب
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                نسبة الطلاب المستمرين أسبوعياً
              </p>
            </div>

            <ResponsiveContainer height={220} width="100%">
              <LineChart
                data={retentionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                {/* Dashed Grid */}
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                {/* X Axis: Weeks */}
                <XAxis
                  dataKey="n"
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  tickMargin={10}
                />

                {/* Y Axis: Exact ticks from the image (50, 65, 80, 100) */}
                <YAxis
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  domain={[50, 100]}
                  ticks={[50, 65, 80, 100]}
                />

                {/* Line without monotone (straight lines) and solid dots */}
                <Line
                  type="linear"
                  dataKey="v"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#22c55e", strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card 4: Horizontal Bar */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="mb-8">
              <h3 className="font-bold text-lg text-slate-800 mb-1">
                أكثر الوحدات صعوبة
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                حسب نسبة الأخطاء
              </p>
            </div>

            <ResponsiveContainer height={220} width="100%">
              <BarChart
                layout="vertical"
                data={difficultyData}
                margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                {/* X Axis (Bottom): 0 to 100 with steps of 25 */}
                <XAxis
                  type="number"
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  tickMargin={10}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />

                {/* Y Axis (Left): Categories */}
                <YAxis
                  dataKey="n"
                  type="category"
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  width={30}
                />

                {/* Red Bars with rounded right corners */}
                <Bar
                  dataKey="v"
                  fill="#ef4444"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card 5: Daily Performance */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="mb-8">
              <h3 className="font-bold text-lg text-slate-800 mb-1">
                أداء التحديات اليومية
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                نسبة النجاح يومياً
              </p>
            </div>

            <ResponsiveContainer height={220} width="100%">
              <BarChart
                data={dailyPerformance}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                {/* Light horizontal grid lines */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                {/* X Axis: Days */}
                <XAxis
                  dataKey="n"
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  tickMargin={10}
                />

                {/* Y Axis: 0 to 100 with steps of 25 */}
                <YAxis
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />

                <Bar
                  dataKey="v"
                  fill="#7c3aed" // Matched the purple color exactly
                  radius={[4, 4, 0, 0]} // Slight rounding at the top
                  barSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card 6: Spline Line Chart */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="mb-8">
              <h3 className="font-bold text-lg text-slate-800">
                عدد المفاتيح المستخدمة شهرياً
              </h3>
            </div>

            <ResponsiveContainer height={220} width="100%">
              <LineChart
                data={monthlyKeys}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                {/* Full grid for the line chart */}
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                {/* X Axis: Months */}
                <XAxis
                  dataKey="n"
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  tickMargin={10}
                />

                {/* Y Axis: 0 to 80 with steps of 20 */}
                <YAxis
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  domain={[0, 80]}
                  ticks={[0, 20, 40, 60, 80]}
                />

                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#eab308" // Yellow/Gold
                  strokeWidth={3}
                  // Styling the dots to be large with a white border
                  dot={{
                    r: 6,
                    fill: "#eab308",
                    strokeWidth: 3,
                    stroke: "#ffffff",
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card 7: List */}
        <Card className="p-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-6 text-slate-800">
              أكثر الأسئلة إضافة للمراجعة
            </h3>

            <div className="space-y-3">
              {[
                {
                  id: 1,
                  text: "ما مقدار الشحنة المختزنة في مكثف...",
                  count: 45,
                },
                { id: 2, text: "اكتشف الخطأ في تعريف التسارع...", count: 38 },
                { id: 3, text: "هل دور النواس يعتمد على كتلته؟", count: 35 },
                { id: 4, text: "حول الوحدات: 3600 ثانية = ...", count: 28 },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50/50"
                >
                  {/* Right Side (Number Badge + Question) */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold shrink-0">
                      {item.id}
                    </div>
                    <span className="text-slate-700 font-medium">
                      {item.text}
                    </span>
                  </div>

                  {/* Left Side (Count) */}
                  <span className="text-blue-600 font-bold shrink-0">
                    {item.count} مرة
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Card 8: Progress Bars */}
        <Card className="p-0">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">متوسط أداء كل مسار</h3>
            {[
              { n: "بكالوريا علمي", v: 76 },
              { n: "بكالوريا أدبي", v: 71 },
              { n: "الصف التاسع", v: 65 },
            ].map((i) => (
              <div key={i.n} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{i.n}</span>
                  <span>{i.v}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${i.v}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
