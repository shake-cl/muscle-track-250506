import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, parseISO,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import type { WorkoutSession } from '../types';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const DOW = ['日', '月', '火', '水', '木', '金', '土'];

export default function CalendarPage() {
  const navigate = useNavigate();
  const { sessions, deleteSession } = useWorkoutStore();
  const { getById } = useExerciseStore();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<WorkoutSession | null>(null);

  const monthStart = startOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(endOfMonth(current), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const sessionMap = new Map(sessions.map((s) => [s.date, s]));

  const prevMonth = () => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDelete = async (id: string) => {
    await deleteSession(id);
    setSelected(null);
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#f8fafc]">カレンダー</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-[#252535] text-[#94a3b8] hover:text-[#f8fafc] transition-all">◀</button>
          <span className="text-base font-semibold text-[#f8fafc] min-w-[120px] text-center">
            {format(current, 'yyyy年 M月', { locale: ja })}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-[#252535] text-[#94a3b8] hover:text-[#f8fafc] transition-all">▶</button>
        </div>
      </div>

      <div className="bg-[#1a1a24] border border-[#2d2d40] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#2d2d40]">
          {DOW.map((d, i) => (
            <div key={d} className={`py-3 text-center text-xs font-semibold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#94a3b8]'}`}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const session = sessionMap.get(dateStr);
            const inMonth = isSameMonth(day, current);
            const today = isToday(day);
            const isSelected = selected?.date === dateStr;
            return (
              <button
                key={i}
                onClick={() => session ? setSelected(isSelected ? null : session) : null}
                className={`min-h-[72px] p-2 border-b border-r border-[#2d2d40] text-left transition-all relative
                  ${!inMonth ? 'opacity-25' : ''}
                  ${session ? 'cursor-pointer hover:bg-[#252535]' : 'cursor-default'}
                  ${isSelected ? 'bg-[#a855f7]/10 border-[#a855f7]/20' : ''}
                `}
              >
                <span className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                  today ? 'bg-[#a855f7] text-white' : 'text-[#94a3b8]'
                }`}>
                  {format(day, 'd')}
                </span>
                {session && (
                  <div className="mt-1 space-y-1">
                    <div className="flex gap-1 flex-wrap">
                      {[...new Set(session.exercises.map((e) => getById(e.exerciseId)?.muscleGroup).filter(Boolean))].slice(0, 3).map((g) => (
                        <span key={g} className={`w-2 h-2 rounded-full ${
                          g === '胸' || g === '肩' || g === '腕' ? 'bg-[#a855f7]' :
                          g === '背中' || g === '体幹' ? 'bg-[#22d3ee]' : 'bg-[#f59e0b]'
                        }`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-[#94a3b8] leading-tight">
                      {session.exercises.length}種目
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="mt-4 bg-[#1a1a24] border border-[#a855f7]/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#f8fafc]">
                {format(parseISO(selected.date), 'M月d日（E）', { locale: ja })}
              </h2>
              {selected.notes && <p className="text-xs text-[#94a3b8] mt-0.5">{selected.notes}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => navigate(`/workout/${selected.id}/edit`)}>編集</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(selected.id)}>削除</Button>
            </div>
          </div>
          <div className="space-y-3">
            {selected.exercises.map((ex, i) => {
              const exercise = getById(ex.exerciseId);
              const totalVol = ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
              const maxWeight = Math.max(...ex.sets.map((s) => s.weight));
              return (
                <div key={i} className="bg-[#252535] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#f8fafc]">{exercise?.name}</span>
                      {exercise && <Badge muscleGroup={exercise.muscleGroup}>{exercise.muscleGroup}</Badge>}
                    </div>
                    <span className="text-xs text-[#94a3b8]">{ex.sets.length}セット</span>
                  </div>
                  <div className="flex gap-4 text-xs text-[#94a3b8]">
                    <span>最大 <span className="text-[#a855f7] font-semibold">{maxWeight}kg</span></span>
                    <span>総vol <span className="text-[#22d3ee] font-semibold">{totalVol.toLocaleString()}kg</span></span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ex.sets.map((s, j) => (
                      <span key={j} className="text-[10px] bg-[#1a1a24] border border-[#2d2d40] rounded-md px-1.5 py-0.5 text-[#94a3b8]">
                        {s.weight}×{s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
