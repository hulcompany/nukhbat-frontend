"use client";

import React, { useState } from "react";
import { Trash2, Plus, Save, Eye, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/components/ui/action-button";
import { FooterSettings } from "./FooterSettings";

const navItems = [
  "القسم الرئيسي (Hero)",
  "الأسئلة الشائعة",
  "التذييل (Footer)",
];

export default function LandingManagementPage() {
  const [activeTab, setActiveTab] = useState("الأسئلة الشائعة");
  const [faqs, setFaqs] = useState([
    { id: 1, question: "كيف يمكنني الاشتراك؟", answer: "الجواب..." },
    { id: 2, question: "هل يمكنني تغيير مساري الدراسي؟", answer: "الجواب..." },
    { id: 3, question: "ما هي المواد المتاحة؟", answer: "الجواب..." },
  ]);

  const addFaq = () => {
    setFaqs([...faqs, { id: Date.now(), question: "", answer: "" }]);
  };

  const removeFaq = (id: number) => {
    setFaqs(faqs.filter((f) => f.id !== id));
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
          <ActionButton
            label="حفظ"
            icon={Save}
            bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200 flex-1 sm:flex-none"
          />
          <ActionButton
            label="الموقع"
            icon={Globe}
            bgClassName="bg-transparent text-gray-700 border-slate-200 hover:bg-slate-50 shadow-xs flex-1 sm:flex-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Navigation - Sidebar on Desktop, Horizontal Scroll on Mobile */}
        <div className="lg:col-span-1">
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide lg:overflow-visible">
            {navItems.map((item) => (
              <div
                key={item}
                onClick={() => setActiveTab(item)}
                className={`p-3 md:p-4 rounded-xl cursor-pointer text-right transition-all whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink ${
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

        {/* Main Content Area */}
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
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <Card key={faq.id} className="border-slate-200 shadow-xs">
                      <CardContent className="p-3 md:p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <Input
                            defaultValue={faq.question}
                            placeholder="نص السؤال"
                            className="font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm md:text-base placeholder:text-slate-400"
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeFaq(faq.id)}
                            className="text-rose-500 hover:bg-rose-50 shrink-0"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        <Textarea
                          defaultValue={faq.answer}
                          placeholder="الجواب..."
                          className="border-0 bg-slate-50/50 rounded-lg text-xs md:text-sm resize-none min-h-[60px] md:min-h-[80px]"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "التذييل (Footer)" && <FooterSettings />}

          {activeTab === "القسم الرئيسي (Hero)" && (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">
                قريباً: إعدادات القسم الرئيسي
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
