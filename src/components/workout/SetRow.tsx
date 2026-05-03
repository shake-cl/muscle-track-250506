import type { WorkoutSet } from '../../types';

interface Props {
  set: WorkoutSet;
  index: number;
  onChange: (index: number, field: keyof WorkoutSet, value: number) => void;
  onDelete: (index: number) => void;
}

export default function SetRow({ set, index, onChange, onDelete }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#94a3b8] w-6 text-right shrink-0">{index + 1}</span>
      <div className="flex items-center gap-1 flex-1">
        <input
          type="number"
          value={set.weight || ''}
          onChange={(e) => onChange(index, 'weight', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min={0}
          step={0.5}
          className="w-full bg-[#252535] border border-[#2d2d40] text-[#f8fafc] rounded-lg px-2 py-1.5 text-sm text-center
            focus:outline-none focus:border-[#a855f7] transition-colors"
        />
        <span className="text-xs text-[#94a3b8] shrink-0">kg</span>
      </div>
      <span className="text-[#94a3b8] text-xs">×</span>
      <div className="flex items-center gap-1 flex-1">
        <input
          type="number"
          value={set.reps || ''}
          onChange={(e) => onChange(index, 'reps', parseInt(e.target.value) || 0)}
          placeholder="0"
          min={0}
          className="w-full bg-[#252535] border border-[#2d2d40] text-[#f8fafc] rounded-lg px-2 py-1.5 text-sm text-center
            focus:outline-none focus:border-[#a855f7] transition-colors"
        />
        <span className="text-xs text-[#94a3b8] shrink-0">回</span>
      </div>
      <button
        onClick={() => onDelete(index)}
        className="text-[#94a3b8] hover:text-red-400 transition-colors text-sm shrink-0 w-6 text-center"
      >
        ✕
      </button>
    </div>
  );
}
