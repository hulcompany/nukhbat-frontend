"use client";

import React from "react";
import { Plus, Check, ShieldCheck, User, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";

const roles = [
  { name: "Content Manager", count: 1, color: "purple" },
  { name: "Super Admin", count: 1, color: "blue" },
];

const permissions = {
  "Super Admin": ["جميع الصلاحيات بالكامل"],
  "Content Manager": [
    "إدارة المناهج",
    "إدارة المواد والدروس",
    "إدارة الأسئلة",
    "استيراد JSON",
    "مراجعة الأسئلة",
  ],
};

const users = [
  {
    name: "المدير العام",
    email: "admin@elite.com",
    role: "Super Admin",
    color: "purple",
    lastLogin: "2026-06-08",
    status: "فعال",
  },
  {
    name: "مدير المحتوى",
    email: "content@elite.com",
    role: "Content Manager",
    color: "blue",
    lastLogin: "2026-06-07",
    status: "فعال",
  },
];

export default function AdminPermissionsPage() {
  const roleStyles: Record<
    string,
    { bg: string; text: string; border: string; iconBg: string }
  > = {
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
    },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-right">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            صلاحيات الأدمن
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة مستخدمي لوحة التحكم وصلاحياتهم
          </p>
        </div>

        <ActionButton
          label="إضافة أدمن"
          icon={Plus}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200 w-full sm:w-auto"
        />
      </div>

      {/* Roles Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => {
          const style = roleStyles[role.color];
          return (
            <Card
              key={role.name}
              className="p-0 overflow-hidden border-slate-200 shadow-sm"
            >
              <CardContent className="p-4 md:p-6 flex flex-col items-center gap-3 text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${style.iconBg} ${style.text}`}
                >
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div
                    className={`font-bold text-base md:text-lg ${style.text}`}
                  >
                    {role.name}
                  </div>
                  <div className="text-xs md:text-sm text-slate-500 font-medium">
                    {role.count} مستخدم
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Roles Permissions View */}
        <Card className="lg:col-span-1 p-0 overflow-hidden border-slate-200">
          <CardContent className="p-4 md:p-6">
            <h2 className="font-bold text-base md:text-lg mb-6 flex items-center gap-2">
              <ShieldCheck className="text-slate-400" size={20} />
              صلاحيات الأدوار
            </h2>
            <div className="space-y-8">
              {Object.entries(permissions).map(([role, perms]) => {
                const isSuper = role === "Super Admin";
                return (
                  <div
                    key={role}
                    className="relative pr-4 border-r-2 border-slate-100"
                  >
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                        isSuper
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {role}
                    </span>
                    <ul className="space-y-2.5">
                      {perms.map((p) => (
                        <li
                          key={p}
                          className="flex items-center gap-2 text-xs md:text-sm text-slate-600 font-medium leading-relaxed"
                        >
                          <Check
                            size={14}
                            className="text-emerald-500 bg-emerald-50 rounded-full shrink-0"
                          />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="lg:col-span-2 p-0 overflow-hidden border-slate-200">
          <CardContent className="p-0">
            <div className="p-4 md:p-6 border-b border-slate-100">
              <h2 className="font-bold text-base md:text-lg flex items-center gap-2 text-slate-800">
                <User className="text-slate-400" size={20} />
                مستخدمو لوحة التحكم
              </h2>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-right border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-xs md:text-sm border-b">
                    <th className="p-4 font-medium">المستخدم</th>
                    <th className="p-4 font-medium text-center">الدور</th>
                    <th className="p-4 font-medium text-center">آخر دخول</th>
                    <th className="p-4 font-medium text-center">الحالة</th>
                    <th className="p-4 font-medium text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u, i) => {
                    const style = roleStyles[u.color];
                    return (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                                u.color === "purple"
                                  ? "bg-purple-600"
                                  : "bg-blue-600"
                              }`}
                            >
                              {u.name[0]}
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-bold text-slate-800 text-sm md:text-base">
                                {u.name}
                              </div>
                              <div className="text-[10px] md:text-xs text-slate-400 truncate">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`border ${style.bg} ${style.text} ${style.border} px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-center text-xs md:text-sm text-slate-500 whitespace-nowrap font-medium">
                          {u.lastLogin}
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                            <Edit2 size={16} className="text-blue-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
