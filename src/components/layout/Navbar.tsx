import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Compass, Bookmark } from 'lucide-react';
import { ApexLogo } from '../ui/ApexLogo';
import { useGarageStore, GarageState } from '../../store/useGarageStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const savedIds = useGarageStore((state: GarageState) => state.savedIds);
  const savedCount = savedIds.length;

  const navItems = [
    { label: 'Catalog', path: '/catalog', icon: <Compass className="w-4 h-4" /> },
    { label: 'Bracket', path: '/bracket', icon: <Trophy className="w-4 h-4" /> },
    {
      label: 'Garage',
      path: '/garage',
      icon: <Bookmark className="w-4 h-4" />,
      badge: savedCount > 0 ? savedCount : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/70 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group" aria-label="APEX Home">
          <ApexLogo width={120} className="transition-opacity duration-200 group-hover:opacity-80" />
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'text-[#14110f] bg-black/5 font-bold'
                    : 'text-neutral-600 hover:text-[#14110f] hover:bg-black/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>

                {/* Saved Badge */}
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#C63A16] text-white rounded-full min-w-[18px] text-center shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C63A16]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
