"use client";

import { useState, useEffect } from "react";
import { Info, Shield, FileText, Save, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UpdateInfoRequest } from "@/types/landing";
import { getInfo, updateInfo } from "@/api/landing";

// IMPORT YOUR APIS HERE (Adjust path as necessary)

type TabKey = "about" | "privacyPolicy" | "termsAndConditions";

export default function AboutAndLegalPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Maintain full state to not overwrite other API fields (like phone, googlePlay, etc)
  const [formData, setFormData] = useState<UpdateInfoRequest>({
    phone: "",
    location: "",
    appStore: "",
    googlePlay: "",
    position: { lat: 0, lng: 0 },
    about: "",
    privacyPolicy: "",
    termsAndConditions: "",
  });

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);

    getInfo()
      .then((res) => {
        const d = res.data.data;
        setFormData({
          phone: d.phone ?? "",
          location: d.location ?? "",
          appStore: d.appStore ?? "",
          googlePlay: d.googlePlay ?? "",
          position: d.position ?? { lat: 0, lng: 0 },
          about: d.about ?? "",
          privacyPolicy: d.privacyPolicy ?? "",
          termsAndConditions: d.termsAndConditions ?? "",
        });
      })
      .catch(() => setErrorMsg("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [activeTab]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await updateInfo(formData);
      setSuccessMsg("تم حفظ التعديلات بنجاح!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error("Failed to save", error);
      setErrorMsg("فشل حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "about", label: "عن المنصة", icon: Info },
    { id: "privacyPolicy", label: "سياسة الخصوصية", icon: Shield },
    { id: "termsAndConditions", label: "الشروط والأحكام", icon: FileText },
  ] as const;

  // Find the currently active tab object so we can render its properties safely
  const activeTabObj = tabs.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">إعدادات حول المنصة</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة النصوص القانونية والتعريفية الخاصة بالمنصة
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-32 h-11"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 ml-2" />
          )}
          حفظ التغييرات
        </Button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center">
          {errorMsg}
        </div>
      )}

      <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
        <div className="flex flex-col md:flex-row">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-l border-slate-200 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right whitespace-nowrap outline-none ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                }`}
              >
                <tab.icon
                  size={18}
                  className={
                    activeTab === tab.id ? "text-white" : "text-slate-400"
                  }
                />
                <span className="font-semibold text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 md:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2
                  size={32}
                  className="animate-spin mb-2 text-blue-600"
                />
                <p>جارٍ تحميل البيانات...</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-slate-800 mb-4">
                  {/* --- FIX: Render the component properly as JSX --- */}
                  {activeTabObj && (
                    <activeTabObj.icon size={20} className="text-blue-600" />
                  )}
                  <h2 className="text-lg font-bold">{activeTabObj?.label}</h2>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    المحتوى (يدعم التنسيق النصي)
                  </Label>
                  <textarea
                    value={formData[activeTab]}
                    onChange={handleContentChange}
                    placeholder={`أدخل نص ${activeTabObj?.label} هنا...`}
                    className="w-full h-[400px] rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent resize-none transition-shadow"
                    dir="rtl"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
