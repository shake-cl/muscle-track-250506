type Color = 'purple' | 'cyan' | 'amber' | 'muted';

const colors: Record<Color, string> = {
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  muted: 'bg-[#252535] text-[#94a3b8] border-[#2d2d40]',
};

const muscleColors: Record<string, Color> = {
  '胸': 'purple', '背中': 'cyan', '脚': 'amber',
  '肩': 'purple', '腕': 'cyan', '体幹': 'amber', 'その他': 'muted',
};

interface Props {
  children: React.ReactNode;
  color?: Color;
  muscleGroup?: string;
  className?: string;
}

export default function Badge({ children, color, muscleGroup, className = '' }: Props) {
  const c = color ?? (muscleGroup ? muscleColors[muscleGroup] ?? 'muted' : 'muted');
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colors[c]} ${className}`}>
      {children}
    </span>
  );
}
