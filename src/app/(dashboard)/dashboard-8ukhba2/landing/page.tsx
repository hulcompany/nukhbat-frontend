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
    <div className="p-8" dir="rtl">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold">إدارة صفحة الهبوط</h1>
          <p className="text-slate-500">تعديل محتوى الموقع الرسمي</p>
        </div>
        <div className="flex gap-2">
          {/* <Button className="gap-2">
            <Save size={18} /> 
          </Button> */}

          <ActionButton
            label="حفظ التغييرات"
            icon={Save}
            bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
          />
          <ActionButton
            label="معاينة الموقع"
            icon={Globe}
            bgClassName="bg-transparent text-gray-700 border-slate-200 hover:bg-slate-50 shadow-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="col-span-1 space-y-2">
          {navItems.map((item) => (
            <div
              key={item}
              onClick={() => setActiveTab(item)}
              className={`p-4 rounded-lg cursor-pointer text-right transition-colors ${activeTab === item ? "bg-blue-50 text-blue-600 font-bold" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main Content Area */}

        {/* Main Content Area */}
        <div className="col-span-3">
          {activeTab === "الأسئلة الشائعة" && (
            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-lg">الأسئلة الشائعة</h2>
                  <ActionButton
                    onClick={addFaq}
                    label="إضافة سؤال"
                    icon={Plus}
                    bgClassName="bg-blue-600 hover:bg-blue-700"
                  />
                </div>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <Card key={faq.id} className="border-slate-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <Input
                            defaultValue={faq.question}
                            placeholder="نص السؤال"
                            className="font-bold border-0"
                          />
                          <Button
                            variant="ghost"
                            onClick={() => removeFaq(faq.id)}
                            className="text-red-500"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                        <Textarea
                          defaultValue={faq.answer}
                          placeholder="الجواب..."
                          className="border-0 bg-slate-50"
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
            <div>{/* Add your Hero settings component here */}</div>
          )}
        </div>
      </div>
    </div>
  );
}
