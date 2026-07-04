"use client";

import React, { useState } from "react";
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
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  { n: "فيزياء", v: 27, c: "#3b82f6" },
  { n: "إنجليزي", v: 12, c: "#38bdf8" },
  { n: "عربي", v: 17, c: "#8b5cf6" },
  { n: "أحياء", v: 9, c: "#ef4444" },
  { n: "كيمياء", v: 14, c: "#f59e0b" },
  { n: "رياضيات", v: 22, c: "#4ade80" },
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
  const [selectedQuestion, setSelectedQuestion] = useState<{
    id: number;
    text: string;
    count: number;
  } | null>(null);

  const reviewQuestions = [
    {
      id: 1,
      text: "ما مقدار الشحنة المختزنة في مكثف سعة 5 ميكروفاراد إذا كان فرق الجهد بين طرفيه 10 فولت؟",
      count: 45,
    },
    {
      id: 2,
      text: "اكتشف الخطأ في تعريف التسارع: هو التغير في المسافة المقطوعة خلال وحدة الزمن في اتجاه معين.",
      count: 38,
    },
    {
      id: 3,
      text: "هل دور النواس البسيط يعتمد على كتلته عند الزوايا الصغيرة؟ علل إجابتك.",
      count: 35,
    },
    {
      id: 4,
      text: "حول الوحدات التالية: 3600 ثانية تساوي ساعة واحدة بالضبط، و 1000 جرام تساوي 1 كيلوجرام.",
      count: 28,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* 1. Header (Tab Switcher) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            الإحصائيات والتحليلات
          </h1>
          <p className="text-sm text-slate-500">تحليلات شاملة لأداء المنصة</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
          {["اليوم", "الأسبوع", "الشهر", "السنة"].map((tab) => (
            <button
              key={tab}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                tab === "الأسبوع"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 8 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Card 1: Pie Chart */}
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-6">
              <h3 className="font-bold text-base md:text-lg text-slate-800 mb-1">
                أكثر المواد استخداماً
              </h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                توزيع الاستخدام بين المواد
              </p>
            </div>

            <div className="h-[220px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Pie
                    data={subjectData}
                    dataKey="v"
                    nameKey="n"
                    outerRadius="70%"
                    stroke="#ffffff"
                    strokeWidth={2}
                    labelLine={false}
                    label={({
                      cx,
                      cy,
                      midAngle = 0,
                      outerRadius = 0,
                      name,
                      fill,
                    }: any) => {
                      const RADIAN = Math.PI / 180;
                      const radius = Number(outerRadius) + 15;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={fill}
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={11}
                          fontWeight={600}
                        >
                          {name}
                        </text>
                      );
                    }}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.c} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Bar Chart */}
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-8">
              <h3 className="font-bold text-base md:text-lg text-slate-800 mb-1">
                عدد الطلاب النشطين يومياً
              </h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                نشاط الطلاب خلال الأسبوع الحالي
              </p>
            </div>

            <div className="h-[220px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyActive}
                  margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    domain={[0, 220]}
                    ticks={[0, 55, 110, 165, 220]}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="v"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Line Chart */}
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-8">
              <h3 className="font-bold text-base md:text-lg text-slate-800 mb-1">
                معدل الاحتفاظ بالطلاب
              </h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                نسبة الطلاب المستمرين أسبوعياً
              </p>
            </div>

            <div className="h-[220px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={retentionData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="n"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    domain={[50, 100]}
                    ticks={[50, 65, 80, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="v"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#22c55e",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Horizontal Bar */}
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-8">
              <h3 className="font-bold text-base md:text-lg text-slate-800 mb-1">
                أكثر الوحدات صعوبة
              </h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                حسب نسبة الأخطاء
              </p>
            </div>

            <div className="h-[220px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={difficultyData}
                  margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickMargin={10}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <YAxis
                    dataKey="n"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                    width={60}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="v"
                    fill="#ef4444"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Daily Performance */}
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-8">
              <h3 className="font-bold text-base md:text-lg text-slate-800 mb-1">
                أداء التحديات اليومية
              </h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                نسبة النجاح يومياً
              </p>
            </div>

            <div className="h-[220px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyPerformance}
                  margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="n"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="v"
                    fill="#7c3aed"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Spline Line Chart */}
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-8">
              <h3 className="font-bold text-base md:text-lg text-slate-800">
                عدد المفاتيح المستخدمة شهرياً
              </h3>
            </div>

            <div className="h-[220px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyKeys}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="n"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    domain={[0, 80]}
                    ticks={[0, 20, 40, 60, 80]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#eab308"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#eab308",
                      strokeWidth: 2,
                      stroke: "#ffffff",
                    }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 7: List */}
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-bold mb-6 text-slate-800">
              أكثر الأسئلة إضافة للمراجعة
            </h3>

            <div className="space-y-3">
              {reviewQuestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedQuestion(item)}
                  className="flex items-center justify-between p-3 md:p-4 border border-slate-200 rounded-xl md:rounded-2xl bg-slate-50/50 gap-3 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 text-blue-600 text-xs md:text-sm font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {item.id}
                    </div>
                    <span className="text-slate-700 text-xs md:text-sm font-medium truncate">
                      {item.text}
                    </span>
                  </div>
                  <span className="text-blue-600 text-xs md:text-sm font-bold shrink-0 whitespace-nowrap">
                    {item.count} مرة
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 8: Progress Bars */}
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <h3 className="font-bold text-base md:text-lg mb-6 text-slate-800">
              متوسط أداء كل مسار
            </h3>
            <div className="space-y-5">
              {[
                { n: "بكالوريا علمي", v: 76 },
                { n: "بكالوريا أدبي", v: 71 },
                { n: "الصف التاسع", v: 65 },
              ].map((i) => (
                <div key={i.n} className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm font-medium text-slate-600">
                    <span>{i.n}</span>
                    <span className="text-blue-600 font-bold">{i.v}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${i.v}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!selectedQuestion}
        onOpenChange={(open) => !open && setSelectedQuestion(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-600 flex items-center gap-2">
              <span>تفاصيل السؤال</span>
              <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full font-medium text-blue-700">
                رقم {selectedQuestion?.id}
              </span>
            </DialogTitle>
            <DialogDescription>
              النص الكامل للسؤال المضاف للمراجعة
            </DialogDescription>
          </DialogHeader>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
            <p className="text-slate-800 leading-relaxed font-bold text-right text-lg">
              {selectedQuestion?.text}
            </p>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm text-slate-500 font-medium">
            <span>عدد الإضافات للمراجعة:</span>
            <span className="text-blue-600 font-bold text-base">
              {selectedQuestion?.count} مرة
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
