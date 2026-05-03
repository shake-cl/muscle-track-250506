import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import type { WorkoutExercise, WorkoutSet } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ExerciseSelector from '../components/workout/ExerciseSelector';
import SetRow from '../components/workout/SetRow';

export default function WorkoutPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { addSession, updateSession, sessions } = useWorkoutStore();
  const { getById } = useExerciseStore();

  const existing = id ? sessions.find((s) => s.id === id) : undefined;

  const [date, setDate] = useState(existing?.date ?? format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [exercises, setExercises] = useState<WorkoutExercise[]>(existing?.exercises ?? []);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    if (existing) {
      setDate(existing.date);
      setNotes(existing.notes ?? '');
      setExercises(existing.exercises);
    }
  }, [existing]);

  const addExercise = (exerciseId: string) => {
    setExercises((prev) => [...prev, { exerciseId, sets: [{ weight: 0, reps: 0 }] }]);
    setShowSelector(false);
  };

  const removeExercise = (i: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addSet = (exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 0 }] } : ex
      )
    );
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof WorkoutSet, value: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)),
            }
      )
    );
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
      )
    );
  };

  const handleSave = async () => {
    if (exercises.length === 0) return;
    const session = { id: existing?.id ?? nanoid(), date, exercises, notes };
    if (existing) {
      await updateSession(session);
    } else {
      await addSession(session);
    }
    navigate('/');
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f8fafc] mb-1">
          {existing ? 'ワークアウトを編集' : 'ワークアウトを記録'}
        </h1>
        <p className="text-[#94a3b8] text-sm">種目とセットを追加してください</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="日付" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="メモ（任意）" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="今日のコンディションなど" />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {exercises.map((ex, exIdx) => {
          const exercise = getById(ex.exerciseId);
          return (
            <div key={exIdx} className="bg-[#1a1a24] border border-[#2d2d40] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#f8fafc]">{exercise?.name ?? ex.exerciseId}</span>
                  {exercise && <Badge muscleGroup={exercise.muscleGroup}>{exercise.muscleGroup}</Badge>}
                </div>
                <button
                  onClick={() => removeExercise(exIdx)}
                  className="text-[#94a3b8] hover:text-red-400 transition-colors text-sm"
                >
                  削除
                </button>
              </div>

              <div className="flex text-xs text-[#94a3b8] mb-2 px-1 gap-2">
                <span className="w-6" />
                <span className="flex-1 text-center">重量</span>
                <span className="w-4" />
                <span className="flex-1 text-center">回数</span>
                <span className="w-6" />
              </div>

              <div className="space-y-2">
                {ex.sets.map((s, sIdx) => (
                  <SetRow
                    key={sIdx}
                    set={s}
                    index={sIdx}
                    onChange={(si, f, v) => updateSet(exIdx, si, f, v)}
                    onDelete={(si) => removeSet(exIdx, si)}
                  />
                ))}
              </div>

              <button
                onClick={() => addSet(exIdx)}
                className="mt-3 w-full py-1.5 rounded-xl border border-dashed border-[#2d2d40] text-xs text-[#94a3b8] hover:border-[#a855f7]/50 hover:text-[#a855f7] transition-all"
              >
                ＋ セットを追加
              </button>
            </div>
          );
        })}

        <button
          onClick={() => setShowSelector(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-[#2d2d40] hover:border-[#a855f7]/50 transition-all
            flex items-center justify-center gap-2 text-[#94a3b8] hover:text-[#a855f7]"
        >
          <span className="text-xl">＋</span>
          <span className="text-sm font-medium">種目を追加</span>
        </button>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>キャンセル</Button>
        <Button onClick={handleSave} disabled={exercises.length === 0} className="flex-1">
          {existing ? '更新する' : '記録する'}
        </Button>
      </div>

      <Modal open={showSelector} onClose={() => setShowSelector(false)} title="種目を選択">
        <ExerciseSelector onSelect={addExercise} />
      </Modal>
    </div>
  );
}
