"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Zap, Loader2, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getTracks } from "@/api/tracks";
import { getSchoolLeaderboard } from "@/api/leaderboard";
import { Track } from "@/types/track";
import { LeaderboardEntry } from "@/types/leaderboard";
import { ApiError } from "@/lib/errors";

const PAGE_SIZE = 10;
const MEDAL_CLASSES = ["bg-yellow-500", "bg-slate-400", "bg-amber-700"];

function formatError(e: unknown): string {
  if (e instanceof ApiError && e.code === "BAD_INPUT" && e.serverMessage) {
    return e.serverMessage;
  }
  return (e as Error).message;
}

function formatDate(iso: string): string {
  return iso.split("T")[0];
}

export default function CompetitionPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const [trackId, setTrackId] = useState("");
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(0);

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTracks()
      .then((res) => {
        setTracks(res.data);
        if (res.data.length > 0) {
          setTrackId(res.data[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false))
      .finally(() => setTracksLoaded(true));
  }, []);

  function fetchLeaderboard() {
    if (!trackId) return;
    setLoading(true);
    setError(null);
    getSchoolLeaderboard(trackId, {
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      sort,
    })
      .then((res) => {
        setEntries(res.data.list);
        setTotalRecords(res.data.totalRecords);
      })
      .catch((e) => setError(formatError(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, page, sort]);

  const showPodium =
    !loading && !error && page === 0 && sort === "DESC" && entries.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            المنافسة والترتيب
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ترتيب الطلاب حسب نقاط الخبرة (XP)
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-lg px-6 h-11 transition-all disabled:opacity-50"
          disabled={loading || !trackId}
          onClick={fetchLeaderboard}
        >
          تحديث الترتيب
          <RefreshCcw className="mr-2 h-4 w-4" />
        </Button>
      </div>

      {tracksLoaded && tracks.length === 0 ? (
        <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
          <EmptyState
            title="لا توجد مسارات"
            description="يجب إضافة مسار دراسي أولاً حتى يظهر هنا ترتيب الطلاب."
          />
        </Card>
      ) : (
        <>
          {/* Track Filters & Sort */}
          <Card className="border border-slate-200 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setTrackId(track.id);
                      setPage(0);
                    }}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      trackId === track.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
              <select
                className="h-11 rounded-lg border border-slate-200 bg-slate-100/50 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-blue-200 shrink-0"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as "ASC" | "DESC");
                  setPage(0);
                }}
              >
                <option value="DESC">الأعلى نقاطاً أولاً</option>
                <option value="ASC">الأدنى نقاطاً أولاً</option>
              </select>
            </div>
          </Card>

          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 size={24} className="animate-spin ml-2" />
              جارٍ التحميل...
            </div>
          )}

          {!loading && error && (
            <ErrorState message={error} onRetry={fetchLeaderboard} />
          )}

          {!loading && !error && entries.length === 0 && (
            <EmptyState
              icon={Trophy}
              title="لا يوجد ترتيب بعد"
              description="لم يقم أي طالب من هذا المسار بحل أي تحدٍ حتى الآن."
            />
          )}

          {!loading && !error && entries.length > 0 && (
            <>
              {/* Top 3 Podium Cards */}
              {showPodium && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {entries.slice(0, 3).map((entry, idx) => (
                    <Card
                      key={entry.studentId}
                      className="border-slate-200 shadow-xs p-8 flex flex-col items-center text-center relative overflow-visible"
                    >
                      <div className="relative mb-4">
                        <div
                          className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm z-10 ${MEDAL_CLASSES[idx]}`}
                        >
                          {idx + 1}
                        </div>
                        <div className="w-16 h-16 bg-[#16192b] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                          {entry.student.user.name.charAt(0)}
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base mb-1">
                        {entry.student.user.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        {entry.student.track.name}
                      </p>

                      <div className="flex items-center gap-1.5 text-amber-500 font-bold text-lg">
                        <span>{entry.xp}</span>
                        <Zap className="h-5 w-5 fill-amber-500" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Ranking Table */}
              <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-center whitespace-nowrap">
                          الترتيب
                        </th>
                        <th className="px-6 py-4 whitespace-nowrap">
                          الطالب
                        </th>
                        <th className="px-4 py-4 text-center whitespace-nowrap">
                          نقاط الخبرة
                        </th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">
                          تاريخ الانضمام
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {entries.map((entry, idx) => {
                        const rank = page * PAGE_SIZE + idx + 1;
                        const isTopRank = sort === "DESC" && rank <= 3;
                        return (
                          <tr
                            key={entry.studentId}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            {/* Rank Badge */}
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${
                                  isTopRank
                                    ? MEDAL_CLASSES[rank - 1] +
                                      " text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {rank}
                              </div>
                            </td>

                            {/* Student Info */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#16192b] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                  {entry.student.user.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-900">
                                    {entry.student.user.name}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {entry.student.user.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* XP */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold">
                                <span>{entry.xp}</span>
                                <Zap className="h-4 w-4 fill-amber-500" />
                              </div>
                            </td>

                            {/* Join Date */}
                            <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                              {formatDate(entry.student.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Pagination */}
              {totalRecords > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    السابق
                  </Button>
                  <span className="text-sm text-slate-500">
                    صفحة {page + 1} من{" "}
                    {Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))}
                  </span>
                  <Button
                    variant="outline"
                    disabled={(page + 1) * PAGE_SIZE >= totalRecords}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
