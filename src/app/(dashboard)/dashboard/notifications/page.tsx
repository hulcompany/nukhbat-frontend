"use client";

import { Eye, Bell, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";

const stats = [
  { label: "إجمالي المستلمين", value: "500" },
  { label: "مسودة", value: "1" },
  { label: "مجدول", value: "1" },
  { label: "مرسل", value: "2" },
];

const notifications = [
  {
    title: "تذكير بالمراجعة",
    desc: "لديك أسئلة في قائمة المراجعة، حان وقت العمل",
    type: "مراجعة الأسئلة المحفوظة",
    target: "كل الطلاب",
    time: "2026-06-01",
    status: "مرسل",
    reach: "320",
    openRate: 67,
  },
  {
    title: "تحدي اليوم - فيزياء",
    desc: "تحدي اليوم في وحدة النواس جاهز، هل أنت مستعد؟",
    type: "إشعار للتحدي اليومي",
    target: "بكالوريا علمي",
    time: "2026-06-08 07:00",
    status: "مرسل",
    reach: "180",
    openRate: 81,
  },
  {
    title: "اشتراكك على وشك الانتهاء",
    desc: "اشتراكك ينتهي خلال 30 يوماً، جدد الآن",
    type: "إشعار لتجديد الاشتراك",
    target: "الطلاب المشتركون",
    time: "2026-07-01",
    status: "مجدول",
    reach: "0",
    openRate: null,
  },
  {
    title: "عودة للدراسة",
    desc: "لاحظنا غيابك! عد الآن وتابع مسيرتك الدراسية",
    type: "إشعار للطلاب غير النشطين",
    target: "الطلاب غير النشطين",
    time: "—",
    status: "مسودة",
    reach: "0",
    openRate: null,
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">الإشعارات</h1>
          <p className="text-sm text-slate-500">
            إدارة وإرسال الإشعارات للطلاب
          </p>
        </div>
        <ActionButton
          label="إرسال إشعار"
          icon={Send}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-0">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-slate-500">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notifications Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-right border-collapse min-w-200">
            <thead>
              <tr className="text-slate-400 text-sm border-b">
                <th className="p-4">العنوان</th>
                <th className="p-4">النوع</th>
                <th className="p-4">الفئة المستهدفة</th>
                <th className="p-4">وقت الإرسال</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">المستلمون</th>
                <th className="p-4">الفاتحون</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-bold flex items-center gap-2 whitespace-nowrap">
                      <Bell size={16} className="text-slate-400" /> {n.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate md:max-w-none md:whitespace-normal">
                      {n.desc}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                    {n.type}
                  </td>
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                    {n.target}
                  </td>
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                    {n.time}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap ${n.status === "مرسل" ? "bg-green-100 text-green-700 border-green-200" : n.status === "مجدول" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{n.reach}</td>
                  <td className="p-4">
                    {n.openRate ? (
                      <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${n.openRate}%` }}
                          ></div>
                        </div>
                        {n.openRate}%
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button className="p-1 hover:bg-blue-50 rounded-md transition-colors group">
                      <Eye size={18} className="text-blue-500 cursor-pointer" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
