import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'ダッシュボード', icon: '◈' },
  { to: '/workout/new', label: '記録する', icon: '＋' },
  { to: '/calendar', label: 'カレンダー', icon: '▦' },
  { to: '/progress', label: '進捗', icon: '↗' },
  { to: '/exercises', label: '種目', icon: '◎' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-[#1a1a24] border-r border-[#2d2d40] flex flex-col z-40">
      <div className="px-6 py-6 border-b border-[#2d2d40]">
        <div className="flex items-center gap-2">
          <span className="text-xl">💪</span>
          <span className="text-base font-bold bg-gradient-to-r from-[#a855f7] to-[#22d3ee] bg-clip-text text-transparent">
            MuscleTrack
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30'
                  : 'text-[#94a3b8] hover:bg-[#252535] hover:text-[#f8fafc]'
              }`
            }
          >
            <span className="text-base leading-none w-5 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-[#2d2d40]">
        <p className="text-xs text-[#94a3b8]/50">v1.0.0</p>
      </div>
    </aside>
  );
}
