import React, { useState } from 'react';
import { Sliders, Shield, AlertTriangle, CheckSquare, Zap, Power, HelpCircle, Apple, Download, Smartphone } from 'lucide-react';
import { SetupConfig } from '../../types/trading';
import { sound } from '../../utils/audio';

interface StrategyTabProps {
  setup: SetupConfig;
  onChangeSetup: (setup: SetupConfig) => void;
  onOpenInstallModal?: () => void;
}

export const StrategyTab: React.FC<StrategyTabProps> = ({ setup, onChangeSetup, onOpenInstallModal }) => {
  const [hardStopTriggered, setHardStopTriggered] = useState(false);

  const handlePhaseChange = (phase: '1' | '2') => {
    sound.playTap();
    onChangeSetup({ ...setup, propPhase: phase });
  };

  const handleTriggerHardStop = () => {
    sound.playAlarmTone();
    setHardStopTriggered(true);
  };

  const targetAmount = setup.accountSize * (setup.propPhase === '1' ? 0.10 : 0.05);

  return (
    <div className="space-y-4 pb-24 pt-2 px-3.5 select-none" dir="rtl">
      {/* Prop Account Header Card */}
      <div className="ios-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">هدف حساب پراپ فرم</h3>
              <p className="text-[11px] text-slate-400">تنظیم فاز و سقف هدف سودآوری</p>
            </div>
          </div>

          <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
            تارگت: ${targetAmount.toLocaleString()}
          </span>
        </div>

        {/* Phase 1 / Phase 2 Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5" dir="ltr">
          <button
            type="button"
            onClick={() => handlePhaseChange('1')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              setup.propPhase === '1'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Phase 1 (هدف ۱۰٪ = $20,000)
          </button>
          <button
            type="button"
            onClick={() => handlePhaseChange('2')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              setup.propPhase === '2'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Phase 2 (هدف ۵٪ = $10,000)
          </button>
        </div>
      </div>

      {/* Account Parameters */}
      <div className="ios-card-sm p-3.5 space-y-3">
        <span className="text-xs font-bold text-white block">پارامترهای پایه مدیریت سرمایه</span>
        
        <div className="grid grid-cols-2 gap-3" dir="ltr">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">موجودی اولیه (Balance)</label>
            <input
              type="number"
              value={setup.accountSize}
              onChange={(e) => onChangeSetup({ ...setup, accountSize: parseFloat(e.target.value) || 200000 })}
              className="ios-input w-full p-2.5 text-xs font-mono font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">ارزش نقدی هر 1R (دلار)</label>
            <input
              type="number"
              value={setup.riskValue}
              onChange={(e) => onChangeSetup({ ...setup, riskValue: parseFloat(e.target.value) || 1000 })}
              className="ios-input w-full p-2.5 text-xs font-mono font-bold text-cyan-400 text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3" dir="ltr">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">تایم‌فریم اصلی</label>
            <input
              type="text"
              value={setup.timeframe}
              onChange={(e) => onChangeSetup({ ...setup, timeframe: e.target.value })}
              className="ios-input w-full p-2.5 text-xs font-mono text-center"
            />
          </div>

          <div>
            <label className="block text-[11px] text-rose-400 mb-1">حد ضرر مجاز روزانه</label>
            <input
              type="text"
              value={setup.stoploss}
              onChange={(e) => onChangeSetup({ ...setup, stoploss: e.target.value })}
              className="ios-input w-full p-2.5 text-xs font-mono text-rose-400 text-center font-bold"
            />
          </div>
        </div>
      </div>

      {/* Allowed Markets & Liquidity Filter */}
      <div className="ios-card-sm p-3.5 space-y-2">
        <label className="block text-xs font-bold text-white">نمادهای مجاز (فیلتر نقدینگی)</label>
        <textarea
          value={setup.markets}
          onChange={(e) => onChangeSetup({ ...setup, markets: e.target.value })}
          placeholder="EUR/USD, GBP/USD, XAU/USD..."
          className="ios-input w-full p-2.5 h-16 text-xs text-slate-200"
        />
      </div>

      {/* Confirmed Setup Conditions (Trading Edge) */}
      <div className="ios-card p-3.5 space-y-2 border-r-4 border-cyan-400">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white">شرایط ستاپ تایید شده (لبه معاملاتی)</h4>
        </div>
        <textarea
          value={setup.setups}
          onChange={(e) => onChangeSetup({ ...setup, setups: e.target.value })}
          placeholder="قواعد دقیق ورود و خروج..."
          className="ios-input w-full p-2.5 h-24 text-xs text-slate-200 leading-relaxed"
        />
      </div>

      {/* Red Lines (No Trade Conditions) */}
      <div className="ios-card p-3.5 space-y-2 border-r-4 border-rose-500">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h4 className="text-xs font-bold text-white">خط قرمزها (منع معامله)</h4>
        </div>
        <textarea
          value={setup.noTrade}
          onChange={(e) => onChangeSetup({ ...setup, noTrade: e.target.value })}
          placeholder="اخبار پیش‌رو، خستگی، استرس یا انتقام‌جویی..."
          className="ios-input w-full p-2.5 h-20 text-xs text-slate-200 leading-relaxed"
        />
      </div>

      {/* Emergency Hard Stop Protocol */}
      <div className="ios-card p-4 space-y-3 bg-rose-950/20 border-rose-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold text-white">پروتکل خروج اضطراری (Hard Stop)</h4>
          </div>

          <button
            type="button"
            onClick={handleTriggerHardStop}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
          >
            تست کلید اضطراری
          </button>
        </div>

        <input
          type="text"
          value={setup.afterStop}
          onChange={(e) => onChangeSetup({ ...setup, afterStop: e.target.value })}
          placeholder="بستن تمام پوزیشن‌ها و خاموش کردن سیستم تا فردا."
          className="ios-input w-full p-2.5 text-xs text-rose-200"
        />

        {hardStopTriggered && (
          <div className="p-3 rounded-xl bg-rose-900/60 border border-rose-500/40 text-xs text-rose-100 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">🚨 پروتکل اضطراری فعال شد!</p>
              <p className="text-[11px] text-rose-200 mt-0.5">
                طبق قانون، تمام موقعیت‌ها را ببندید، از مارکت فاصله بگیرید و تا فردا چارت را باز نکنید.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* iOS App & IPA Download Section */}
      <div className="ios-card p-4 space-y-3 bg-gradient-to-br from-[#121622] to-[#0c0f16] border border-cyan-500/30 shadow-lg shadow-cyan-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Apple className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-xs text-white">نصب روی آیفون و دریافت فایل IPA</h4>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                  iOS Native
                </span>
              </div>
              <p className="text-[11px] text-slate-400">دانلود بسته IPA یا نصب مستقیم بدون نیاز به کامپیوتر</p>
            </div>
          </div>

          {onOpenInstallModal && (
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onOpenInstallModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              مرکز دانلود
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
