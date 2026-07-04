"use client";
import { useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const role = await login(email, password);
      if (role === "admin") {
        router.push("/dashboard-8ukhba2");
      } else if (role === "contentWriter") {
        router.push("/dashboard");
      } else {
        setError("هذا الحساب غير مصرح له بالوصول إلى لوحة التحكم");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Card Section */}
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@elite.com"
                dir="ltr"
                className="text-right"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="........"
                  dir="ltr"
                  className="text-right pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-colors disabled:opacity-60"
              onClick={handleSubmit}
              disabled={loading || !email || !password}
            >
              {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
