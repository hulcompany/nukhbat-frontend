import { RefreshCcw, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Mock Data for the Top 3 Podium
const topStudents = [
  {
    rank: 1,
    name: "نور الدين علي",
    track: "بكالوريا علمي",
    gems: 780,
    avatar: "ن",
    medalColor: "bg-yellow-500",
  },
  {
    rank: 2,
    name: "أحمد محمد الخطيب",
    track: "بكالوريا علمي",
    gems: 450,
    avatar: "أ",
    medalColor: "bg-slate-400",
  },
  {
    rank: 3,
    name: "سارة عبد الرحمن النجار",
    track: "بكالوريا أدبي",
    gems: 320,
    avatar: "س",
    medalColor: "bg-amber-700",
  },
];

// Mock Data for the Ranking Table
const rankingData = [
  {
    rank: 1,
    name: "نور الدين علي",
    avatar: "ن",
    track: "بكالوريا علمي",
    gems: 780,
    correct: 1890,
    units: 28,
    streak: 45,
    accuracy: 90,
    status: "نشط",
  },
  {
    rank: 2,
    name: "أحمد محمد الخطيب",
    avatar: "أ",
    track: "بكالوريا علمي",
    gems: 450,
    correct: 980,
    units: 18,
    streak: 22,
    accuracy: 79,
    status: "نشط",
  },
  {
    rank: 3,
    name: "سارة عبد الرحمن النجار",
    avatar: "س",
    track: "بكالوريا أدبي",
    gems: 320,
    correct: 710,
    units: 12,
    streak: 15,
    accuracy: 80,
    status: "نشط",
  },
  {
    rank: 4,
    name: "ليلى حسن إبراهيم",
    avatar: "ل",
    track: "بكالوريا علمي",
    gems: 180,
    correct: 380,
    units: 8,
    streak: 8,
    accuracy: 73,
    status: "نشط",
  },
  {
    rank: 5,
    name: "خالد إبراهيم المصري",
    avatar: "خ",
    track: "الصف التاسع",
    gems: 120,
    correct: 250,
    units: 5,
    streak: 3,
    accuracy: 68,
    status: "مستبعد",
  },
];

const trackFilters = [
  "كل المسارات",
  "الصف التاسع",
  "بكالوريا علمي",
  "بكالوريا أدبي",
];

const criteriaFilters = [
  "عدد الجواهر",
  "عدد الأسئلة الصحيحة",
  "عدد الوحدات المنجزة",
  "عدد أيام الاستمرار",
  "نسبة الدقة",
  "التحديات اليومية المنجزة",
];

export default function CompetitionPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            المنافسة والترتيب
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ترتيب الطلاب حسب الإنجازات والجواهر
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-lg px-6 h-11 transition-all"
        >
          إعادة احتساب النقاط
          <RefreshCcw className="mr-2 h-4 w-4" />
        </Button>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topStudents.map((student) => (
          <Card
            key={student.rank}
            className="border-slate-200 shadow-xs p-8 flex flex-col items-center text-center relative overflow-visible"
          >
            {/* Avatar & Medal Container */}
            <div className="relative mb-4">
              {/* Medal Badge */}
              <div
                className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm z-10 ${student.medalColor}`}
              >
                {student.rank}
              </div>
              {/* Avatar Block */}
              <div className="w-16 h-16 bg-[#16192b] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                {student.avatar}
              </div>
            </div>

            {/* Student Info */}
            <h3 className="font-bold text-slate-900 text-base mb-1">
              {student.name}
            </h3>
            <p className="text-sm text-slate-500 mb-4">{student.track}</p>

            {/* Gems Score */}
            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-lg">
              <span>{student.gems}</span>
              <Diamond className="h-5 w-5 fill-amber-500" />
            </div>
          </Card>
        ))}
      </div>

      {/* Track Filters */}
      <Card className="border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3 flex-row">
        {trackFilters.map((track, idx) => (
          <button
            key={track}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              idx === 0
                ? "bg-slate-900 text-white" // The dark active state
                : "bg-slate-100 text-slate-600 hover:bg-slate-200" // The light inactive state
            }`}
          >
            {track}
          </button>
        ))}
      </Card>

      {/* Ranking Criteria Card */}
      <Card className="border-slate-200 shadow-xs p-4 flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <h3 className="font-bold text-slate-900 shrink-0">الترتيب حسب</h3>
        <div className="flex flex-wrap gap-2">
          {criteriaFilters.map((criteria, idx) => (
            <button
              key={criteria}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                idx === 0
                  ? "bg-blue-100 text-blue-700"
                  : "bg-blue-50/50 text-blue-600 hover:bg-blue-50"
              }`}
            >
              {criteria}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Ranking Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  الترتيب
                </th>
                <th className="px-6 py-4 whitespace-nowrap">الطالب</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  المسار
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  الجواهر
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  الأسئلة الصحيحة
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  الوحدات
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  أيام الاستمرار
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap min-w-[120px]">
                  نسبة الدقة
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  الحالة
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rankingData.map((row) => (
                <tr
                  key={row.rank}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Rank Badge */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${
                        row.rank === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : row.rank === 2
                            ? "bg-slate-200 text-slate-700"
                            : row.rank === 3
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {row.rank}
                    </div>
                  </td>

                  {/* Student Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#16192b] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {row.avatar}
                      </div>
                      <span className="font-medium text-slate-900">
                        {row.name}
                      </span>
                    </div>
                  </td>

                  {/* Track */}
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.track}
                  </td>

                  {/* Gems */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold">
                      <span>{row.gems}</span>
                      <Diamond className="h-4 w-4 fill-amber-500" />
                    </div>
                  </td>

                  {/* Stats */}
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.correct}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.units}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.streak}
                  </td>

                  {/* Accuracy Progress Bar */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-medium text-xs w-8 text-right">
                        {row.accuracy}%
                      </span>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex-row-reverse flex">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${row.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        row.status === "نشط"
                          ? "bg-emerald-100 text-emerald-600 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {row.status === "نشط" ? (
                      <button className="bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-200 px-4 py-1.5 rounded-full text-xs font-bold transition-colors">
                        استبعاد
                      </button>
                    ) : (
                      <button className="bg-emerald-100 text-emerald-600 border border-emerald-200 hover:bg-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold transition-colors">
                        إعادة
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
