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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { forgetPassword, resetPassword } from "@/api/auth";
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

  const [forgetOpen, setForgetOpen] = useState(false);
  const [forgetStep, setForgetStep] = useState<"email" | "reset" | "done">(
    "email",
  );
  const [forgetEmail, setForgetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgetLoading, setForgetLoading] = useState(false);
  const [forgetError, setForgetError] = useState("");

  function openForgetDialog() {
    setForgetStep("email");
    setForgetEmail(email);
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setForgetError("");
    setForgetOpen(true);
  }

  async function handleForgetPassword(e: React.SubmitEvent) {
    e.preventDefault();
    setForgetError("");
    setForgetLoading(true);
    try {
      const res = await forgetPassword({ email: forgetEmail });
      if (res.data.sent) {
        setForgetStep("reset");
      } else {
        setForgetError(
          `تم الإرسال مسبقاً، يمكنك المحاولة مرة أخرى بعد ${new Date(
            res.data.nextAttempt,
          ).toLocaleTimeString("ar-SA")}`,
        );
      }
    } catch (err) {
      setForgetError(
        err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى",
      );
    } finally {
      setForgetLoading(false);
    }
  }

  async function handleResetPassword(e: React.SubmitEvent) {
    e.preventDefault();
    setForgetError("");
    if (newPassword !== confirmPassword) {
      setForgetError("كلمتا المرور غير متطابقتين");
      return;
    }
    setForgetLoading(true);
    try {
      await resetPassword({
        email: forgetEmail,
        code: resetCode,
        newPassword,
        confirmPassword,
      });
      setForgetStep("done");
    } catch (err) {
      setForgetError(
        err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى",
      );
    } finally {
      setForgetLoading(false);
    }
  }

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
        <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-6 shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] overflow-hidden">
          <img
            src="/images/logo.webp"
            alt="شعار النُخبة"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          لوحة تحكم النُخبة
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
              <button
                type="button"
                onClick={openForgetDialog}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
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

      {/* Forget Password Dialog */}
      <Dialog open={forgetOpen} onOpenChange={setForgetOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-6">إعادة تعيين كلمة المرور</DialogTitle>
          </DialogHeader>
          {forgetStep === "email" && (
            <form onSubmit={handleForgetPassword} className="space-y-4 mt-2">
              <p className="text-sm text-slate-500">
                أدخل بريدك الإلكتروني وسنرسل لك رمز إعادة تعيين كلمة المرور
              </p>
              <div className="space-y-2">
                <Label
                  htmlFor="forget-email"
                  className="text-slate-700 font-medium"
                >
                  البريد الإلكتروني
                </Label>
                <Input
                  id="forget-email"
                  type="email"
                  placeholder="admin@elite.com"
                  dir="ltr"
                  className="text-right"
                  value={forgetEmail}
                  onChange={(e) => setForgetEmail(e.target.value)}
                  disabled={forgetLoading}
                  required
                />
              </div>
              {forgetError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 text-center">
                  {forgetError}
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgetOpen(false)}
                  className="h-11 p-4 px-7"
                >
                  إغلاق
                </Button>
                <Button
                  type="submit"
                  disabled={forgetLoading || !forgetEmail}
                  className="h-11 p-4 px-7 bg-blue-600 hover:bg-blue-700"
                >
                  {forgetLoading ? "جاري الإرسال..." : "إرسال الرمز"}
                </Button>
              </div>
            </form>
          )}

          {forgetStep === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
              <p className="text-sm text-slate-500">
                تم إرسال رمز التحقق إلى{" "}
                <span dir="ltr" className="font-medium text-slate-700">
                  {forgetEmail}
                </span>
                ، أدخل الرمز وكلمة المرور الجديدة
              </p>
              <div className="space-y-2">
                <Label
                  htmlFor="reset-code"
                  className="text-slate-700 font-medium"
                >
                  رمز التحقق
                </Label>
                <Input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  dir="ltr"
                  className="text-right"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  disabled={forgetLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="new-password"
                  className="text-slate-700 font-medium"
                >
                  كلمة المرور الجديدة
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  dir="ltr"
                  className="text-right"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={forgetLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-slate-700 font-medium"
                >
                  تأكيد كلمة المرور
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  dir="ltr"
                  className="text-right"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={forgetLoading}
                  required
                />
              </div>
              {forgetError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 text-center">
                  {forgetError}
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgetStep("email");
                    setForgetError("");
                  }}
                  className="h-11 p-4 px-7"
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  disabled={
                    forgetLoading ||
                    !resetCode ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className="h-11 p-4 px-7 bg-blue-600 hover:bg-blue-700"
                >
                  {forgetLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
                </Button>
              </div>
            </form>
          )}

          {forgetStep === "done" && (
            <div className="space-y-4 mt-2">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 text-center">
                تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={() => setForgetOpen(false)}
                  className="h-11 p-4 px-7 bg-blue-600 hover:bg-blue-700"
                >
                  تسجيل الدخول
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
