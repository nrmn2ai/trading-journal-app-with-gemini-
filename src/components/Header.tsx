import React from 'react';
import { Bell, Download, Upload, Share, Sparkles, Smartphone, Volume2, Apple } from 'lucide-react';
import { CalculatedStats } from '../utils/storage';
import { SetupConfig } from '../types/trading';
import { sound } from '../utils/audio';

interface HeaderProps {
  stats: CalculatedStats;
  setup: SetupConfig;
  alarmTime: string;
  onOpenAlarmModal: () => void;
  onOpenInstallModal: () => void;
  onOpenCsvModal: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  setup,
  alarmTime,
  onOpenAlarmModal,
  onOpenInstallModal,
  onOpenCsvModal,
  onExportData,
}) => {
  return (
    <header className="sticky top-0 z-30 ios-glass-header px-4 pt-2 pb-3 transition-all select-none">
      <div className="max-w-[430px] mx-auto flex items-center justify-between gap-2">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#161a24] to-[#0d1017] p-1 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <span className="font-mono font-black text-sm text-cyan-400">N2</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-950 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5" dir="ltr">
              <span className="font-black text-sm font-mono tracking-tight text-white">
                NRMN<span className="text-cyan-400">2</span>AI
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md">
                iOS OS
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
              پراپ فاز {setup.propPhase} (${(setup.accountSize / 1000).toLocaleString()}k)
            </span>
          </div>
        </div>

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Alarm Pill */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenAlarmModal();
            }}
            className={`h-8 px-2 rounded-xl flex items-center gap-1 text-[11px] font-mono font-bold border transition-all ios-btn ${
              alarmTime
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-500/20'
                : 'bg-white/5 border-white/8 text-slate-400 hover:text-white'
            }`}
            title="آلارم سشن و اخبار"
          >
            <Bell className={`w-3.5 h-3.5 ${alarmTime ? 'text-cyan-400 animate-bounce' : ''}`} />
            {alarmTime ? alarmTime : <span className="font-sans text-[10px]">آلارم</span>}
          </button>

          {/* CSV / Data Sync */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenCsvModal();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-slate-300 hover:text-white ios-btn"
            title="ورود داده CSV / بکاپ"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Export JSON */}
          <button
            onClick={() => {
              sound.playSuccess();
              onExportData();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-slate-300 hover:text-white ios-btn"
            title="خروجی JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Download IPA & iOS Install */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenInstallModal();
            }}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black flex items-center gap-1.5 text-xs font-black transition-all shadow-md shadow-cyan-400/25 shrink-0"
            title="دانلود فایل IPA و انتشار در GitHub"
          >
            <Apple className="w-3.5 h-3.5 fill-black" />
            <span className="text-[11px]">دانلود IPA</span>
          </button>
        </div>
      </div>
    </header>
  );
};
