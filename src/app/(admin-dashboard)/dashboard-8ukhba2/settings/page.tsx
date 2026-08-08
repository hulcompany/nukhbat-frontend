"use client";

import React, { useRef, useState } from "react";
import {
  Globe,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  User,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/components/ui/action-button";
import { updateMyUser } from "@/api/user";
import { downloadFile } from "@/api/files";
import { useAuth } from "@/context/AuthContext";

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

  React.useEffect(() => {
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

const tabs = [
  // { name: "الإعدادات العامة", icon: Globe },
  { name: "الملف الشخصي", icon: User },
  // { name: "الإشعارات", icon: Bell },
  { name: "الأمان", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("الإعدادات العامة");

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1" dir="rtl">
      <div className="flex justify-between items-start flex-col sm:flex-row gap-3">
        <div className="text-right">
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-slate-500">إعدادات النظام ولوحة التحكم</p>
        </div>
        <ActionButton
          label="حفظ الإعدادات"
          icon={Save}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200 w-full sm:w-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors ${
                  activeTab === tab.name
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Icon size={20} /> {tab.name}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="col-span-3">
          {activeTab === "الإعدادات العامة" && <GeneralSettings />}
          {activeTab === "الملف الشخصي" && <ProfileSettings />}
          {activeTab === "الإشعارات" && <NotificationSettings />}
          {activeTab === "الأمان" && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <Card className="p-0">
      <CardContent className="p-6 space-y-6">
        <h2 className="font-bold text-lg">الإعدادات العامة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="platform-name">اسم المنصة</Label>
            <Input id="platform-name" placeholder="النخبة الأوائل" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">البريد الإلكتروني للدعم</Label>
            <Input id="support-email" placeholder="support@elite.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-time">مدة جلسة الأدمن (ساعة)</Label>
            <Input id="session-time" placeholder="8" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initial-gems">عدد الجواهر الابتدائية</Label>
            <Input id="initial-gems" placeholder="0" />
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <div className="font-bold">وضع الصيانة</div>
            <div className="text-sm text-slate-500">
              إيقاف الوصول للطلاب مؤقتاً
            </div>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  const notifications = [
    "تسجيل طالب جديد",
    "طلب دعم جديد",
    "نقص المفاتيح",
    "انتهاء صلاحية مفاتيح",
  ];
  return (
    <Card className="p-0">
      <CardContent className="p-6 space-y-6">
        <h2 className="font-bold text-lg">إعدادات الإشعارات</h2>
        <p className="text-sm text-slate-500">
          اختر متى تريد تلقي إشعارات في لوحة التحكم:
        </p>
        <div className="divide-y divide-slate-100">
          {notifications.map((n) => (
            <div key={n} className="flex items-center justify-between py-4">
              <div className="font-medium text-slate-700">{n}</div>
              <Switch defaultChecked={n !== "انتهاء صلاحية مفاتيح"} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSettings() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const imageRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function selectImage(file: File | null) {
    if (file && !file.type.startsWith("image/")) return;
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setImageFile(file);
    if (!file && imageRef.current) imageRef.current.value = "";
  }

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedName = name.trim();
    const nameChanged = trimmedName !== "" && trimmedName !== user?.name;

    if (!nameChanged && !imageFile) {
      setError("لا يوجد تغييرات للحفظ");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateMyUser({
        ...(nameChanged ? { name: trimmedName } : {}),
        ...(imageFile ? { image: imageFile } : {}),
      });
      updateUser(res.data);
      selectImage(null);
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
        <h2 className="font-bold text-lg">الملف الشخصي</h2>
        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="profile-name">الاسم</Label>
            <Input
              id="profile-name"
              placeholder="ادخل الاسم"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-image">الصورة الشخصية</Label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              ref={imageRef}
              className="hidden"
              onChange={(e) => selectImage(e.target.files?.[0] ?? null)}
            />
            <div
              onClick={() => imageRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                selectImage(e.dataTransfer.files?.[0] ?? null);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging
                  ? "bg-blue-50 border-blue-400"
                  : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-blue-300"
              }`}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="الصورة الشخصية"
                  className="w-16 h-16 rounded-full object-cover mb-3"
                />
              ) : user?.profileImage ? (
                <FileImage
                  fileId={user.profileImage}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
              )}
              {imageFile ? (
                <>
                  <p className="text-sm font-bold text-slate-900">
                    {imageFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectImage(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 mt-1"
                  >
                    إزالة الصورة
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-900">
                    اسحب الصورة هنا
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    أو انقر لاختيار صورة
                  </p>
                </>
              )}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-600">تم حفظ التغييرات بنجاح</p>
          )}
          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 h-11 transition-all shadow-sm shadow-blue-200 w-full sm:w-auto"
          >
            {submitting ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const { updateUser } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleChangePassword(e: React.SubmitEvent) {
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
      const res = await updateMyUser({ password: newPassword });
      updateUser(res.data);
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
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
