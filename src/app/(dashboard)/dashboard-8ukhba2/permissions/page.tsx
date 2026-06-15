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
  return (
    <div className="p-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold">صلاحيات الأدمن</h1>
          <p className="text-slate-500">إدارة مستخدمي لوحة التحكم وصلاحياتهم</p>
        </div>

        <ActionButton
          label="إضافة أدمن"
          icon={Plus}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
        />
      </div>

      {/* Roles Summary */}
      <div className="flex gap-4">
        {roles.map((role) => (
          <Card key={role.name} className="w-48 text-center p-0">
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <ShieldCheck
                className={`text-${role.color}-700 bg-${role.color}-100 rounded-full w-10 h-10 p-2 text-500`}
              />
              <div className={`font-bold text-${role.color}-700`}>
                {role.name}
              </div>
              <div className="text-sm text-slate-500">{role.count} مستخدم</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Roles Permissions View */}
        <Card className="col-span-1 p-0">
          <CardContent className="p-6">
            <h2 className="font-bold mb-4">صلاحيات الأدوار</h2>
            {Object.entries(permissions).map(([role, perms]) => (
              <div key={role} className="mb-6">
                <span
                  className={`bg-${role === "Content Manager" ? "blue" : "purple"}-100 text-${role === "Content Manager" ? "blue" : "purple"}-600 px-2 py-1 rounded-full text-xs`}
                >
                  {role}
                </span>
                <ul className="mt-2 space-y-2">
                  {perms.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <Check
                        size={16}
                        className="text-green-500 bg-green-50 rounded-full"
                      />{" "}
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="col-span-2">
          <CardContent className="">
            <h2 className="font-bold mb-4 px-4">مستخدمو لوحة التحكم</h2>
            <table className="w-full text-right">
              <thead>
                <tr className="text-slate-400 text-sm border-b">
                  <th className="p-4">المستخدم</th>
                  <th className="p-4">الدور</th>
                  <th className="p-4">آخر دخول</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4 flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full bg-${u.color}-600 text-white flex items-center justify-center font-bold`}
                      >
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="font-bold">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`border bg-${u.color}-50 text-${u.color}-600 border-${u.color}-200 px-2 py-1 rounded-full text-xs whitespace-nowrap`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {u.lastLogin}
                    </td>
                    <td className="p-4">
                      <span className="border bg-green-100 text-green-700 border-green-200 px-3 py-1 rounded-full text-xs">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Edit2
                        size={16}
                        className="text-blue-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
