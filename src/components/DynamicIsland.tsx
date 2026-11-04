import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, CheckCircle, Clock, Volume2, Plus, X } from 'lucide-react';
import { CalculatedStats } from '../utils/storage';
import { SetupConfig } from '../types/trading';
import { sound } from '../utils/audio';

interface DynamicIslandProps {
  stats: CalculatedStats;
  setup: SetupConfig;
  currentDay: number;
  alarmTime: string;
  onOpenTradeModal: () => void;
  onOpenAlarmModal: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  stats,
  setup,
  currentDay,
  alarmTime,
  onOpenTradeModal,
  onOpenAlarmModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [activeSession, setActiveSession] = useState({ name: 'لندن', color: 'text-emerald-400', flag: '🇬🇧' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h.toString().padStart(2, '0')}:${m}`);

      // Global market sessions (Tehran / UTC reference)
      // London: ~11:30 to 19:30 Tehran time | NY: ~16:30 to 01:00 Tehran time
      if (h >= 11 && h < 16) {
        setActiveSession({ name: 'لندن (London)', color: 'text-cyan-400', flag: '🇬🇧' });
      } else if (h >= 16 && h < 22) {
        setActiveSession({ name: 'نیویورک (NY Overlap)', color: 'text-emerald-400', flag: '🇺🇸' });
      } else if (h >= 22 || h < 4) {
        setActiveSession({ name: 'پایان نیویورک', color: 'text-amber-400', flag: '🇺🇸' });
      } else {
        setActiveSession({ name: 'سشن آسیا (Tokyo)', color: 'text-purple-400', flag: '🇯🇵' });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = () => {
    sound.playTap();
    setIsExpanded((prev) => !prev);
  };

  const isProfitable = stats.todayUSD >= 0;

  return (
    <div className="relative z-50 flex justify-center w-full px-4 pt-1 select-none">
      {/* Background Dimmer when expanded */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 animate-fade-in"
        />
      )}

      {/* Dynamic Island Capsule */}
      <div
        onClick={!isExpanded ? toggleExpand : undefined}
        className={`relative z-50 transition-all duration-300 ease-out bg-black border border-white/10 shadow-2xl overflow-hidden cursor-pointer ${
          isExpanded
            ? 'w-full max-w-[360px] rounded-[38px] p-5 ring-1 ring-cyan-500/20 shadow-cyan-500/10'
            : 'h-[36px] px-3.5 rounded-full flex items-center justify-between gap-3 hover:scale-[1.02] active:scale-95'
        }`}
      >
        {!isExpanded ? (
          /* Compact Dynamic Island */
          <div className="flex items-center justify-between w-full gap-2.5 text-xs font-mono font-medium" dir="ltr">
            {/* Left side: Camera cutout simulator & Live icon */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-sans font-semibold text-slate-300">
                {activeSession.flag} {activeSession.name.split(' ')[0]}
              </span>
            </div>

            {/* Middle sensor dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10 shrink-0" />

            {/* Right side: Today PnL */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <span className={isProfitable ? 'text-emerald-400' : 'text-rose-400'}>
                {isProfitable ? '+' : ''}${Math.abs(stats.todayUSD).toLocaleString()}
              </span>
              {alarmTime && (
                <Bell className="w-3 h-3 text-cyan-400 ml-0.5 animate-bounce" />
              )}
            </div>
          </div>
        ) : (
          /* Expanded Live Activity State */
          <div className="flex flex-col gap-4 text-white" dir="rtl">
            {/* Top Bar with Camera cutout simulator & Close */}
            <div className="flex items-center justify-between" dir="ltr">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Live Activity
                </span>
              </div>

              {/* Physical Sensor Dot */}
              <div className="w-3 h-3 rounded-full bg-[#181818] border border-white/20" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playTap();
                  setIsExpanded(false);
                }}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-90 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Stats Row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium">سود امروز (روز {currentDay})</span>
                <div className="mt-1 flex items-baseline gap-1" dir="ltr">
                  <span className={`text-xl font-bold font-mono ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfitable ? '+' : ''}${stats.todayUSD.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">({stats.todayR}R)</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium">سشن معاملاتی</span>
                <div className="mt-1 flex items-center gap-1.5 font-bold text-sm">
                  <span>{activeSession.flag}</span>
                  <span className={activeSession.color}>{activeSession.name}</span>
                </div>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400">تارگت فاز {setup.propPhase} (${setup.accountSize * (setup.propPhase === '1' ? 0.1 : 0.05) / 1000}k)</span>
                <span className="font-mono text-cyan-400 font-bold" dir="ltr">
                  {stats.progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden" dir="ltr">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, stats.progressPercent))}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playTap();
                  setIsExpanded(false);
                  onOpenTradeModal();
                }}
                className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
                ثبت پوزیشن جدید
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playTap();
                  setIsExpanded(false);
                  onOpenAlarmModal();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Bell className="w-3.5 h-3.5 text-cyan-400" />
                {alarmTime ? `هشدار (${alarmTime})` : 'تنظیم آلارم'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
