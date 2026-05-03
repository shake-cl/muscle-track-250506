import { useState } from 'react';
import { useExerciseStore } from '../store/exerciseStore';
import type { MuscleGroup } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

const GROUPS: MuscleGroup[] = ['胸', '背中', '脚', '肩', '腕', '体幹', 'その他'];

export default function ExercisesPage() {
  const { exercises, addExercise, deleteExercise } = useExerciseStore();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<MuscleGroup>('その他');
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all');

  const grouped = GROUPS.reduce<Record<MuscleGroup, typeof exercises>>((acc, g) => {
    acc[g] = exercises.filter((e) => e.muscleGroup === g && (filter === 'all' || filter === g));
    return acc;
  }, {} as any);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addExercise(newName.trim(), newGroup);
    setNewName('');
    setNewGroup('その他');
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f8fafc]">種目ライブラリ</h1>
        <Button onClick={() => setShowModal(true)}>＋ 種目を追加</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${filter === 'all' ? 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30' : 'bg-[#252535] text-[#94a3b8] border-[#2d2d40]'}`}
        >
          すべて
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${filter === g ? 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30' : 'bg-[#252535] text-[#94a3b8] border-[#2d2d40]'}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {GROUPS.map((g) => {
          const list = grouped[g];
          if (list.length === 0) return null;
          return (
            <div key={g} className="bg-[#1a1a24] border border-[#2d2d40] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d2d40]">
                <Badge muscleGroup={g}>{g}</Badge>
                <span className="text-xs text-[#94a3b8]">{list.length}種目</span>
              </div>
              <div className="divide-y divide-[#2d2d40]">
                {list.map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#f8fafc]">{e.name}</span>
                      {e.isCustom && <span className="text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 px-1.5 py-0.5 rounded-md">カスタム</span>}
                    </div>
                    {e.isCustom && (
                      <button
                        onClick={() => deleteExercise(e.id)}
                        className="text-xs text-[#94a3b8] hover:text-red-400 transition-colors"
                      >
                        削除
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="種目を追加">
        <div className="space-y-4">
          <Input
            label="種目名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例: ダンベルショルダープレス"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div>
            <p className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider mb-2">部位</p>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setNewGroup(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    newGroup === g ? 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30' : 'bg-[#252535] text-[#94a3b8] border-[#2d2d40]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>キャンセル</Button>
            <Button className="flex-1" onClick={handleAdd} disabled={!newName.trim()}>追加する</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
