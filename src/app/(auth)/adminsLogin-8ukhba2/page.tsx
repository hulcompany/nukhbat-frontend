"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans"
    >
      {/* Header Section */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6 shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]">
          <span className="text-white text-3xl font-bold">ن</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          لوحة تحكم النخبة الأوائل
        </h1>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
          إدارة الطلاب، المناهج، الأسئلة، الاشتراكات، والإحصائيات من مكان واحد.
        </p>
      </div>

      {/* Card Section - UPDATED SHADOW AND BORDER */}
      <Card className="w-full max-w-105 bg-white border border-slate-100 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] p-7">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold text-slate-900">
            تسجيل الدخول
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            أدخل بيانات حسابك للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@elite.com"
                dir="ltr"
                className="text-right -xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="password"
                  className="text-slate-700 font-medium"
                >
                  كلمة المرور
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="........"
                  dir="ltr"
                  className="text-right  pl-11"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 cursor-pointer">
                  <Eye size={20} />
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <Link
                href="#"
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-colors"
              onClick={() => router.push("/dashboard-8ukhba2")}
            >
              تسجيل الدخول
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
