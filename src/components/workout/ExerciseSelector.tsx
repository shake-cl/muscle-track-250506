import { useState } from 'react';
import { useExerciseStore } from '../../store/exerciseStore';
import type { MuscleGroup } from '../../types';
import Badge from '../ui/Badge';
import Input from '../ui/Input';

const GROUPS: MuscleGroup[] = ['胸', '背中', '脚', '肩', '腕', '体幹', 'その他'];

interface Props {
  onSelect: (exerciseId: string) => void;
}

export default function ExerciseSelector({ onSelect }: Props) {
  const { exercises } = useExerciseStore();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'all'>('all');

  const filtered = exercises.filter((e) => {
    const matchGroup = group === 'all' || e.muscleGroup === group;
    const matchQuery = e.name.includes(query);
    return matchGroup && matchQuery;
  });

  return (
    <div className="space-y-3">
      <Input
        placeholder="種目を検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setGroup('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            group === 'all' ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30' : 'bg-[#252535] text-[#94a3b8] border border-[#2d2d40]'
          }`}
        >
          すべて
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              group === g ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30' : 'bg-[#252535] text-[#94a3b8] border border-[#2d2d40]'
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
        {filtered.length === 0 && (
          <p className="text-center text-[#94a3b8] text-sm py-6">見つかりませんでした</p>
        )}
        {filtered.map((e) => (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#252535] hover:bg-[#2d2d45] transition-all text-left"
          >
            <span className="text-sm text-[#f8fafc]">{e.name}</span>
            <Badge muscleGroup={e.muscleGroup}>{e.muscleGroup}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
