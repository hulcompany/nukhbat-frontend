import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function FooterSettings() {
  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <h2 className="font-bold text-lg mb-6">التذييل والتواصل</h2>

        <div className="space-y-8 md:space-y-10">
          {/* Contact Numbers */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
              أرقام التواصل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">هاتف 1</Label>
                <Input placeholder="+963 912 345 678" className="h-10 md:h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">هاتف 2</Label>
                <Input placeholder="+963 911 234 567" className="h-10 md:h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">واتساب</Label>
                <Input placeholder="+963 912 345 678" className="h-10 md:h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                  البريد الإلكتروني
                </Label>
                <Input placeholder="info@elite-edu.com" className="h-10 md:h-11 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
              روابط السوشيال ميديا
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">instagram</Label>
                <Input placeholder="https://instagram.com/elite" className="h-10 md:h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">facebook</Label>
                <Input placeholder="https://facebook.com/elite" className="h-10 md:h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">youtube</Label>
                <Input placeholder="https://youtube.com/elite" className="h-10 md:h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">twitter</Label>
                <Input placeholder="https://twitter.com/elite" className="h-10 md:h-11 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
              الصفحات القانونية
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">سياسة الخصوصية</Label>
                <Textarea
                  placeholder="نص سياسة الخصوصية..."
                  className="min-h-[100px] md:min-h-[150px] rounded-xl bg-slate-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">شروط الاستخدام</Label>
                <Textarea
                  placeholder="نص شروط الاستخدام..."
                  className="min-h-[100px] md:min-h-[150px] rounded-xl bg-slate-50/50"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
