"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMySchool } from "@/api/schools";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1" dir="rtl">
      <div className="text-right">
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-slate-500">إعدادات الأمان لحسابك</p>
      </div>

      <div className="max-w-2xl">
        <SecuritySettings />
      </div>
    </div>
  );
}

// Sections below are kept for when more settings are added.
// Re-add a sidebar tab switcher (see git history) once there's more than one section.

// function GeneralSettings() {
//   return (
//     <Card className="p-0">
//       <CardContent className="p-6 space-y-6">
//         <h2 className="font-bold text-lg">الإعدادات العامة</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <Label htmlFor="platform-name">اسم المنصة</Label>
//             <Input id="platform-name" placeholder="النخبة الأوائل" />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="support-email">البريد الإلكتروني للدعم</Label>
//             <Input id="support-email" placeholder="support@elite.com" />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function NotificationSettings() {
//   const notifications = [
//     "تسجيل طالب جديد",
//     "طلب دعم جديد",
//     "نقص المفاتيح",
//     "انتهاء صلاحية مفاتيح",
//   ];
//   return (
//     <Card className="p-0">
//       <CardContent className="p-6 space-y-6">
//         <h2 className="font-bold text-lg">إعدادات الإشعارات</h2>
//         <p className="text-sm text-slate-500">
//           اختر متى تريد تلقي إشعارات في لوحة التحكم:
//         </p>
//         <div className="divide-y divide-slate-100">
//           {notifications.map((n) => (
//             <div key={n} className="flex items-center justify-between py-4">
//               <div className="font-medium text-slate-700">{n}</div>
//               <Switch defaultChecked={n !== "انتهاء صلاحية مفاتيح"} />
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

function SecuritySettings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!newPassword) {
      setError("يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setSubmitting(true);
    try {
      await updateMySchool({ password: newPassword });
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-0">
      <CardContent className="p-6 space-y-6">
        <h2 className="font-bold text-lg">إعدادات الأمان</h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="ادخل كلمة المرور الجديدة"
                dir="ltr"
                className="text-right pl-11"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600"
                onClick={() => setShowNewPassword((v) => !v)}
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="اعد ادخال كلمة المرور الجديدة"
                dir="ltr"
                className="text-right pl-11"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-600">
              تم تغيير كلمة المرور بنجاح
            </p>
          )}
          <Button
            type="submit"
            disabled={submitting}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-6 h-11 transition-all shadow-sm shadow-red-200 w-full sm:w-auto"
          >
            {submitting ? "جاري الحفظ..." : "تغيير كلمة المرور"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
