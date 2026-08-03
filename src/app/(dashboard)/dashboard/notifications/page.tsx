"use client";

import { useEffect, useState } from "react";
import { Eye, Bell, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Notification } from "@/types/notification";
import { getMyNotifications } from "@/api/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setError(null);
      try {
        const res = await getMyNotifications({ skip: 0, limit: 10 });
        setNotifications(res.data.list);
      } catch (err) {
        console.error("Failed to load notifications", err);
        setError("حدث خطأ أثناء تحميل الإشعارات");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

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
      </div>

      {/* Notifications Table */}
      <Card className="p-0 overflow-hidden min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-2 text-blue-600" />
            <p>جارٍ تحميل الإشعارات...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            لا توجد إشعارات حالياً
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className="text-slate-400 text-sm border-b bg-slate-50/50">
                  <th className="p-4 font-medium">العنوان والتفاصيل</th>
                  <th className="p-4 font-medium">تاريخ الإرسال</th>
                  <th className="p-4 font-medium">حالة القراءة</th>
                  <th className="p-4 font-medium">حالة الفتح</th>
                  <th className="p-4 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold flex items-center gap-2 whitespace-nowrap text-slate-900">
                        <Bell size={16} className="text-blue-500" /> {n.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 max-w-[250px] truncate md:max-w-none md:whitespace-normal">
                        {n.description}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                          n.isRead
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {n.isRead ? "مقروء" : "غير مقروء"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                          n.isOpen
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {n.isOpen ? "مفتوح" : "غير مفتوح"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="p-2 hover:bg-blue-50 rounded-md transition-colors group">
                        <Eye
                          size={18}
                          className="text-slate-400 group-hover:text-blue-600 cursor-pointer transition-colors"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
