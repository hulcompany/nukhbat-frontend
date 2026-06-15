import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function FooterSettings() {
  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <h2 className="font-bold text-lg mb-6">التذييل والتواصل</h2>

        <div className="space-y-6">
          {/* Contact Numbers */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-slate-700">
              أرقام التواصل
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">هاتف 1</Label>
                <Input placeholder="+963 912 345 678" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">هاتف 2</Label>
                <Input placeholder="+963 911 234 567" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">واتساب</Label>
                <Input placeholder="+963 912 345 678" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">
                  البريد الإلكتروني
                </Label>
                <Input placeholder="info@elite-edu.com" />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-slate-700">
              روابط السوشيال ميديا
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">instagram</Label>
                <Input placeholder="https://instagram.com/elite" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">facebook</Label>
                <Input placeholder="https://facebook.com/elite" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">youtube</Label>
                <Input placeholder="https://youtube.com/elite" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">twitter</Label>
                <Input placeholder="https://twitter.com/elite" />
              </div>
            </div>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-slate-700">
              الصفحات القانونية
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">سياسة الخصوصية</Label>
                <Textarea
                  placeholder="نص سياسة الخصوصية..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">شروط الاستخدام</Label>
                <Textarea
                  placeholder="نص شروط الاستخدام..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
