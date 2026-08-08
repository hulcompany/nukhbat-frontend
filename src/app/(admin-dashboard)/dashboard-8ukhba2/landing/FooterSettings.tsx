"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getInfo, updateInfo } from "@/api/landing";
import { UpdateInfoRequest } from "@/types/landing";

const defaultForm: UpdateInfoRequest = {
  appStore: "",
  googlePlay: "",
  phone: "",
  location: "",
  position: { lat: 0, lng: 0 },
  about: "",
  privacyPolicy: "",
  termsAndConditions: "",
};

export function FooterSettings() {
  const [form, setForm] = useState<UpdateInfoRequest>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    getInfo()
      .then((res) => {
        const d = res.data.data;
        setForm({
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
      .catch(() => setError("فشل تحميل بيانات التواصل"))
      .finally(() => setLoading(false));
  }, []);

  const set = (
    field: keyof Omit<UpdateInfoRequest, "position">,
    value: string,
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  // const setPosition = (axis: "lat" | "lng", value: string) =>
  //   setForm((prev) => ({
  //     ...prev,
  //     position: { ...prev.position, [axis]: parseFloat(value) || 0 },
  //   }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await updateInfo(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("فشل حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 size={24} className="animate-spin ml-2" />
        جارٍ التحميل...
      </div>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">التذييل والتواصل</h2>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-xs gap-2 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6 text-center">
            تم حفظ البيانات بنجاح
          </div>
        )}

        <div className="space-y-8 md:space-y-10">
          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
              بيانات التواصل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                  رقم الهاتف
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+963912345678"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                  الموقع / العنوان
                </Label>
                <Input
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="دمشق، سوريا"
                />
              </div>
            </div>
          </div>

          {/* App Links */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
              روابط التطبيق
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                  App Store
                </Label>
                <Input
                  value={form.appStore}
                  onChange={(e) => set("appStore", e.target.value)}
                  placeholder="https://apps.apple.com/..."
                  dir="ltr"
                />
              </div> */}
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Google Play
                </Label>
                <Input
                  value={form.googlePlay}
                  onChange={(e) => set("googlePlay", e.target.value)}
                  placeholder="https://play.google.com/..."
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Map Position */}
          {/* <div>
            <h3 className="font-bold text-sm mb-4 text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
              إحداثيات الخريطة
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                  خط العرض (Lat)
                </Label>
                <Input
                  type="number"
                  value={form.position.lat || ""}
                  onChange={(e) => setPosition("lat", e.target.value)}
                  placeholder="33.5138"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                  خط الطول (Lng)
                </Label>
                <Input
                  type="number"
                  value={form.position.lng || ""}
                  onChange={(e) => setPosition("lng", e.target.value)}
                  placeholder="36.2765"
                  dir="ltr"
                />
              </div>
            </div>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
