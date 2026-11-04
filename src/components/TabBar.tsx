import React from 'react';
import { BookOpen, LineChart, Sliders, Award, Sparkles, Apple } from 'lucide-react';
import { sound } from '../utils/audio';

export type TabKey = 'daily' | 'chart' | 'strategy' | 'analytics' | 'coach' | 'download';

interface TabBarProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  todayTradeCount: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onChangeTab,
  todayTradeCount,
}) => {
  const handleTabClick = (tab: TabKey) => {
    sound.playTap();
    onChangeTab(tab);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      key: 'daily',
      label: 'امروز',
      icon: <BookOpen className="w-4.5 h-4.5" />,
      badge: todayTradeCount > 0 ? todayTradeCount : undefined,
    },
    {
      key: 'chart',
      label: 'چارت',
      icon: <LineChart className="w-4.5 h-4.5" />,
    },
    {
      key: 'strategy',
      label: 'ستاپ',
      icon: <Sliders className="w-4.5 h-4.5" />,
    },
    {
      key: 'analytics',
      label: 'ارزیابی',
      icon: <Award className="w-4.5 h-4.5" />,
    },
    {
      key: 'coach',
      label: 'مربی AI',
      icon: <Sparkles className="w-4.5 h-4.5" />,
    },
    {
      key: 'download',
      label: 'دانلود IPA',
      icon: <Apple className="w-4.5 h-4.5 fill-cyan-400 text-cyan-400" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 ios-glass-dock pb-[max(env(safe-area-inset-bottom,16px),16px)] pt-2 px-1 sm:px-2 border-t border-white/8 transition-all">
      <div className="max-w-[430px] mx-auto grid grid-cols-6 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 ios-btn ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-normal'
              }`}
            >
              <div className="relative">
                {/* Active Indicator Backdrop */}
                {isActive && (
                  <div className="absolute -inset-1.5 bg-cyan-500/15 rounded-xl blur-xs" />
                )}
                <div className={`relative z-10 transition-transform ${isActive ? 'scale-110 text-cyan-400' : 'scale-100'}`}>
                  {tab.icon}
                </div>

                {/* Optional notification badge */}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-950">
                    {tab.badge}
                  </span>
                )}

                {/* Special IPA tab badge */}
                {tab.key === 'download' && tab.badge === undefined && (
                  <span className="absolute -top-1 -right-2 bg-gradient-to-r from-cyan-400 to-purple-400 text-black font-black text-[7.5px] px-1 py-0.1 rounded-full ring-1 ring-black">
                    IPA
                  </span>
                )}
              </div>

              <span className={`text-[9.5px] sm:text-[10px] mt-1 tracking-tight select-none truncate ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {/* iOS Active Pill Bar */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

