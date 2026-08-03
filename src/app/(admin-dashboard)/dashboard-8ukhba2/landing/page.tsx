"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Trash2, Plus, Save, Globe, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/components/ui/action-button";
import { FooterSettings } from "./FooterSettings";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "@/api/landing";
import { FaqItem } from "@/types/landing";

interface DraftFaq {
  id?: string;
  title: string;
  description: string;
}

const navItems = ["الأسئلة الشائعة", "التذييل"];

export default function LandingManagementPage() {
  const [activeTab, setActiveTab] = useState("الأسئلة الشائعة");
  const [faqs, setFaqs] = useState<DraftFaq[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const newItemRef = useRef<HTMLDivElement>(null);
  const shouldScroll = useRef(false);

  useEffect(() => {
    if (shouldScroll.current && newItemRef.current) {
      newItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      shouldScroll.current = false;
    }
  }, [faqs]);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getFaqs();
      setFaqs(
        res.data.data.map((f: FaqItem) => ({
          id: f.id,
          title: f.title,
          description: f.description,
        })),
      );
    } catch {
      setError("فشل تحميل الأسئلة الشائعة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "الأسئلة الشائعة") fetchFaqs();
  }, [activeTab, fetchFaqs]);

  const addFaq = () => {
    shouldScroll.current = true;
    setFaqs((prev) => [...prev, { title: "", description: "" }]);
  };

  const removeFaq = async (index: number) => {
    const faq = faqs[index];
    if (faq.id) {
      try {
        await deleteFaq(faq.id);
      } catch {
        setError("فشل حذف السؤال");
        return;
      }
    }
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setFaqs((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    );
  };

  const saveAllFaqs = async () => {
    setSaving(true);
    setError("");
    try {
      await Promise.all(
        faqs.map((faq) => {
          const body = { title: faq.title, description: faq.description };
          return faq.id ? updateFaq(faq.id, body) : createFaq(body);
        }),
      );
      await fetchFaqs();
    } catch {
      setError("فشل حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-right">
          <h1 className="text-xl md:text-2xl font-bold">إدارة صفحة الهبوط</h1>
          <p className="text-sm text-slate-500 mt-1">
            تعديل محتوى الموقع الرسمي
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {activeTab === "الأسئلة الشائعة" && (
            <ActionButton
              onClick={saveAllFaqs}
              label={saving ? "جارٍ الحفظ..." : "حفظ"}
              icon={saving ? Loader2 : Save}
              bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200 flex-1 sm:flex-none"
            />
          )}
          <ActionButton
            label="الموقع"
            icon={Globe}
            onClick={() => window.open("/", "_blank")}
            bgClassName="bg-transparent text-gray-700 border-slate-200 hover:bg-slate-50 shadow-xs flex-1 sm:flex-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide lg:overflow-visible">
            {navItems.map((item) => (
              <div
                key={item}
                onClick={() => setActiveTab(item)}
                className={`p-3 md:p-4 rounded-xl cursor-pointer text-right transition-all whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink ${
                  activeTab === item
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-100 lg:bg-blue-50 lg:text-blue-600 lg:shadow-none"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 lg:bg-slate-50"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === "الأسئلة الشائعة" && (
            <Card className="p-0 overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-base md:text-lg">
                    الأسئلة الشائعة
                  </h2>
                  <ActionButton
                    onClick={addFaq}
                    label="إضافة"
                    icon={Plus}
                    bgClassName="bg-blue-600 hover:bg-blue-700 h-9 px-4 text-xs"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 text-center">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-12 text-slate-400">
                    <Loader2 size={24} className="animate-spin ml-2" />
                    جارٍ التحميل...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {faqs.length === 0 && (
                      <p className="text-center text-slate-400 py-8 text-sm">
                        لا توجد أسئلة شائعة. اضغط "إضافة" لإنشاء سؤال جديد.
                      </p>
                    )}
                    {faqs.map((faq, index) => (
                      <Card
                        key={faq.id ?? `new-${index}`}
                        ref={index === faqs.length - 1 ? newItemRef : null}
                        className="border-slate-200 shadow-xs"
                      >
                        <CardContent className="p-3 md:p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <Input
                              value={faq.title}
                              onChange={(e) =>
                                updateField(index, "title", e.target.value)
                              }
                              placeholder="نص السؤال"
                              className="rounded-none font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm md:text-base placeholder:text-slate-400"
                            />
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeFaq(index)}
                              className="text-rose-500 hover:bg-rose-50 shrink-0"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          <Textarea
                            value={faq.description}
                            onChange={(e) =>
                              updateField(index, "description", e.target.value)
                            }
                            placeholder="الجواب..."
                            className="border-0 bg-slate-100 rounded-lg text-xs md:text-sm resize-none min-h-15 md:min-h-20"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "التذييل" && <FooterSettings />}

          {/* {activeTab === "القسم الرئيسي (Hero)" && (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">
                قريباً: إعدادات القسم الرئيسي
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
