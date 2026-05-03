import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, parseISO, startOfWeek, eachWeekOfInterval, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import type { Exercise } from '../types';

const CHART_COLORS = { max: '#a855f7', volume: '#22d3ee' };

type Tab = 'maxWeight' | 'volume';

export default function ProgressPage() {
  const { sessions } = useWorkoutStore();
  const { exercises } = useExerciseStore();
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [tab, setTab] = useState<Tab>('maxWeight');

  const exercisesWithData = useMemo(() => {
    const ids = new Set(sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId)));
    return exercises.filter((e) => ids.has(e.id));
  }, [sessions, exercises]);

  const chartData = useMemo(() => {
    if (!selected) return [];
    const relevant = sessions
      .filter((s) => s.exercises.some((e) => e.exerciseId === selected.id))
      .sort((a, b) => a.date.localeCompare(b.date));

    return relevant.map((s) => {
      const ex = s.exercises.find((e) => e.exerciseId === selected.id)!;
      const max = Math.max(...ex.sets.map((st) => st.weight));
      const vol = ex.sets.reduce((sum, st) => sum + st.weight * st.reps, 0);
      return {
        date: format(parseISO(s.date), 'M/d', { locale: ja }),
        max,
        volume: vol,
      };
    });
  }, [selected, sessions]);

  const weeklyData = useMemo(() => {
    if (sessions.length === 0) return [];
    const dates = sessions.map((s) => parseISO(s.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const weeks = eachWeekOfInterval({ start: startOfWeek(minDate, { weekStartsOn: 1 }), end: maxDate }, { weekStartsOn: 1 });
    return weeks.map((w) => {
      const end = endOfWeek(w, { weekStartsOn: 1 });
      const count = sessions.filter((s) => {
        const d = parseISO(s.date);
        return d >= w && d <= end;
      }).length;
      return { week: format(w, 'M/d', { locale: ja }), count };
    }).slice(-12);
  }, [sessions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#252535] border border-[#2d2d40] rounded-xl px-3 py-2 text-xs">
        <p className="text-[#94a3b8] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}{p.dataKey === 'count' ? '回' : 'kg'}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-[#f8fafc]">進捗</h1>

      <div className="bg-[#1a1a24] border border-[#2d2d40] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">週次トレーニング回数</h2>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d40" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="回数" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-[#94a3b8] text-sm py-10">まだデータがありません</p>
        )}
      </div>

      <div className="bg-[#1a1a24] border border-[#2d2d40] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">種目別進捗</h2>

        {exercisesWithData.length === 0 ? (
          <p className="text-center text-[#94a3b8] text-sm py-10">まだデータがありません</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {exercisesWithData.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelected(selected?.id === e.id ? null : e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    selected?.id === e.id
                      ? 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/40'
                      : 'bg-[#252535] text-[#94a3b8] border-[#2d2d40] hover:text-[#f8fafc]'
                  }`}
                >
                  {e.name}
                </button>
              ))}
            </div>

            {selected && chartData.length > 0 && (
              <>
                <div className="flex gap-2 mb-4">
                  {([['maxWeight', '最大重量'], ['volume', '総ボリューム']] as [Tab, string][]).map(([t, label]) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        tab === t ? 'bg-[#252535] text-[#f8fafc]' : 'text-[#94a3b8] hover:text-[#f8fafc]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d40" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    {tab === 'maxWeight' ? (
                      <Line type="monotone" dataKey="max" name="最大重量(kg)" stroke={CHART_COLORS.max} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS.max }} activeDot={{ r: 6 }} />
                    ) : (
                      <Line type="monotone" dataKey="volume" name="総ボリューム(kg)" stroke={CHART_COLORS.volume} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS.volume }} activeDot={{ r: 6 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}

            {selected && chartData.length === 0 && (
              <p className="text-center text-[#94a3b8] text-sm py-8">データが1件のみです</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
