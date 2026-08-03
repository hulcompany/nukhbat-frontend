"use client";

import { useEffect, useState } from "react";
import { Eye, Bell, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Notification, NotificationStatsData } from "@/types/notification";
import {
  getMyNotifications,
  getNotificationStats,
  markNotificationsAsRead,
} from "@/api/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for stats
  const [stats, setStats] = useState<NotificationStatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

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

    async function fetchStats() {
      setStatsLoading(true);
      try {
        const res = await getNotificationStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchNotifications();
    fetchStats();
  }, []);

  // --- New Function to Handle Reading Notifications ---
  const handleReadNotification = async (
    notificationId: string,
    currentIsRead: boolean,
  ) => {
    // If it's already read, don't do anything
    if (currentIsRead) return;

    try {
      // 1. Call the API
      await markNotificationsAsRead({ ids: [notificationId] });

      // 2. Optimistically update the table so it changes instantly
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );

      // 3. Optimistically decrease the unread counter in the stats cards
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          unRead: Math.max(0, prev.unRead - 1),
        };
      });
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      // You could optionally add a toast notification here to show the error
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">الإشعارات</h1>
          <p className="text-sm text-slate-500">
            إدارة وعرض الإشعارات الخاصة بك
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-0 border-slate-200 shadow-xs">
          <CardContent className="p-4 md:p-6 text-center">
            {statsLoading ? (
              <Loader2
                size={24}
                className="animate-spin mx-auto mb-1 text-slate-400"
              />
            ) : (
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                {stats?.total ?? 0}
              </div>
            )}
            <div className="text-xs md:text-sm text-slate-500 font-medium">
              إجمالي الإشعارات
            </div>
          </CardContent>
        </Card>

        <Card className="p-0 border-slate-200 shadow-xs">
          <CardContent className="p-4 md:p-6 text-center">
            {statsLoading ? (
              <Loader2
                size={24}
                className="animate-spin mx-auto mb-1 text-slate-400"
              />
            ) : (
              <div className="text-2xl md:text-3xl font-bold text-red-600 mb-1">
                {stats?.unRead ?? 0}
              </div>
            )}
            <div className="text-xs md:text-sm text-slate-500 font-medium">
              إشعارات غير مقروءة
            </div>
          </CardContent>
        </Card>
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
                    className={`border-b last:border-0 transition-colors ${n.isRead ? "bg-white hover:bg-slate-50" : "bg-blue-50/30 hover:bg-blue-50/50"}`}
                  >
                    <td className="p-4">
                      <div className="font-bold flex items-center gap-2 whitespace-nowrap text-slate-900">
                        <Bell
                          size={16}
                          className={
                            n.isRead ? "text-slate-400" : "text-blue-500"
                          }
                        />{" "}
                        {n.title}
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
                      {/* --- Updated Button with onClick Event --- */}
                      <button
                        onClick={() => handleReadNotification(n.id, n.isRead)}
                        disabled={n.isRead}
                        className={`p-2 rounded-md transition-colors group ${n.isRead ? "cursor-default opacity-50" : "hover:bg-blue-100 cursor-pointer"}`}
                        title={n.isRead ? "تمت القراءة" : "تحديد كمقروء"}
                      >
                        <Eye
                          size={18}
                          className={`${n.isRead ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"} transition-colors`}
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
