import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, startOfWeek, isWithinInterval, endOfWeek, differenceInCalendarDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import type { WorkoutSession } from '../types';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

function StatCard({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div className={`bg-[#1a1a24] border border-[#2d2d40] rounded-2xl p-5 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
      <p className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-[#f8fafc]">
        {value}
        {unit && <span className="text-sm text-[#94a3b8] ml-1 font-normal">{unit}</span>}
      </p>
    </div>
  );
}

function SessionCard({ session, onEdit }: { session: WorkoutSession; onEdit: () => void }) {
  const { getById } = useExerciseStore();
  const totalSets = session.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  return (
    <div className="bg-[#1a1a24] border border-[#2d2d40] rounded-2xl p-4 hover:border-[#a855f7]/30 transition-all cursor-pointer" onClick={onEdit}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[#f8fafc]">
          {format(parseISO(session.date), 'M月d日（E）', { locale: ja })}
        </span>
        <span className="text-xs text-[#94a3b8]">{session.exercises.length}種目 · {totalSets}セット</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {session.exercises.slice(0, 4).map((ex, i) => {
          const e = getById(ex.exerciseId);
          return e ? <Badge key={i} muscleGroup={e.muscleGroup}>{e.name}</Badge> : null;
        })}
        {session.exercises.length > 4 && (
          <Badge color="muted">+{session.exercises.length - 4}</Badge>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { sessions } = useWorkoutStore();

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const stats = useMemo(() => {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const thisWeek = sessions.filter((s) =>
      isWithinInterval(parseISO(s.date), { start: weekStart, end: weekEnd })
    ).length;

    let streak = 0;
    const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
    let prev = today;
    for (const s of sorted) {
      const d = parseISO(s.date);
      const diff = differenceInCalendarDays(prev, d);
      if (diff <= 1) { streak++; prev = d; } else break;
    }

    return { thisWeek, streak, total: sessions.length };
  }, [sessions]);

  const todaySession = sessions.find((s) => s.date === todayStr);
  const recent = sessions.slice(0, 5);

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">ダッシュボード</h1>
          <p className="text-[#94a3b8] text-sm mt-0.5">{format(today, 'yyyy年M月d日（E）', { locale: ja })}</p>
        </div>
        <Button onClick={() => navigate('/workout/new')}>＋ 記録する</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="今週のトレ" value={stats.thisWeek} unit="回" color="bg-[#a855f7]" />
        <StatCard label="連続記録" value={stats.streak} unit="日" color="bg-[#22d3ee]" />
        <StatCard label="累計セッション" value={stats.total} unit="回" color="bg-[#f59e0b]" />
      </div>

      {todaySession ? (
        <div className="bg-[#1a1a24] border border-[#22d3ee]/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#22d3ee]">✓ 今日のワークアウト完了</h2>
            <Button size="sm" variant="secondary" onClick={() => navigate(`/workout/${todaySession.id}/edit`)}>編集</Button>
          </div>
          <p className="text-xs text-[#94a3b8]">{todaySession.exercises.length}種目 · {todaySession.exercises.reduce((s, e) => s + e.sets.length, 0)}セット</p>
        </div>
      ) : (
        <div
          className="bg-[#1a1a24] border-2 border-dashed border-[#2d2d40] hover:border-[#a855f7]/40 rounded-2xl p-8 text-center cursor-pointer transition-all"
          onClick={() => navigate('/workout/new')}
        >
          <p className="text-4xl mb-3">🏋️</p>
          <p className="text-[#f8fafc] font-semibold">今日のトレーニングを記録しよう</p>
          <p className="text-[#94a3b8] text-sm mt-1">タップして記録を始める</p>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">最近の記録</h2>
          <div className="space-y-3">
            {recent.map((s) => (
              <SessionCard key={s.id} session={s} onEdit={() => navigate(`/workout/${s.id}/edit`)} />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">💪</p>
          <p className="text-[#f8fafc] font-semibold text-lg">まだ記録がありません</p>
          <p className="text-[#94a3b8] text-sm mt-2">最初のワークアウトを記録してみましょう！</p>
        </div>
      )}
    </div>
  );
}
