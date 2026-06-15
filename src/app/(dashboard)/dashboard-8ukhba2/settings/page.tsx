"use client";

import React, { useState } from "react";
import { Globe, Bell, Shield, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/components/ui/action-button";

const tabs = [
  { name: "الإعدادات العامة", icon: Globe },
  { name: "الإشعارات", icon: Bell },
  { name: "الأمان", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("الإعدادات العامة");

  return (
    <div className="p-8 space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <div className="text-right">
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-slate-500">إعدادات النظام ولوحة التحكم</p>
        </div>
        <ActionButton
          label="حفظ الإعدادات"
          icon={Save}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
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

function SecuritySettings() {
  return (
    <Card className="p-0">
      <CardContent className="p-6 space-y-6">
        <h2 className="font-bold text-lg">إعدادات الأمان</h2>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">كلمة المرور الحالية</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="ادخل كلمة المرور الحالية"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="ادخل كلمة المرور الجديدة"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="اعد ادخال كلمة المرور الجديدة"
            />
          </div>
          <Button className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-6 h-11 transition-all shadow-sm shadow-red-200 w-full sm:w-auto">
            تغيير كلمة المرور
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
