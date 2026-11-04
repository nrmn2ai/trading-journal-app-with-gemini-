import React, { useState } from 'react';
import { X, Plus, Calculator, ArrowUpRight, ArrowDownRight, Trash2, Smile, AlertCircle, Zap, Shield, Coffee, Hash, Tag } from 'lucide-react';
import { TradeItem, TradeSentiment } from '../../types/trading';
import { sound } from '../../utils/audio';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: TradeItem) => void;
  riskValue: number;
}

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  riskValue,
}) => {
  const [symbol, setSymbol] = useState('EUR/USD');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [sentiment, setSentiment] = useState<TradeSentiment>('Confident');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#scalp']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [entry, setEntry] = useState('');
  const [tp, setTp] = useState('');
  const [sl, setSl] = useState('');
  const [r, setR] = useState('1.5');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const quickSymbols = ['EUR/USD', 'GBP/USD', 'XAU/USD', 'BTC/USD', 'NAS100', 'US30'];

  const predefinedTags = [
    { tag: '#swing', label: 'سوینگ', desc: 'معامله میان‌مدت' },
    { tag: '#scalp', label: 'اسکالپ', desc: 'نوسان‌گیری سریع' },
    { tag: '#news', label: 'اخبار', desc: 'حرکت تقویم اقتصادی' },
    { tag: '#reversal', label: 'ریورسال', desc: 'برگشت روند و تغییر فاز' },
    { tag: '#breakout', label: 'بریک‌اوت', desc: 'شکست سطح کلیدی' },
    { tag: '#trend', label: 'روندی', desc: 'ادامه‌دهنده در جهت ترند' },
  ];

  const handleToggleTag = (tag: string) => {
    sound.playTap();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    let formatted = customTagInput.trim().toLowerCase();
    if (!formatted.startsWith('#')) formatted = '#' + formatted;
    if (!selectedTags.includes(formatted)) {
      sound.playSuccess();
      setSelectedTags((prev) => [...prev, formatted]);
    }
    setCustomTagInput('');
  };

  const sentimentOptions: {
    key: TradeSentiment;
    label: string;
    en: string;
    desc: string;
    color: string;
    activeClass: string;
  }[] = [
    {
      key: 'Confident',
      label: 'مطمئن 🎯',
      en: 'Confident',
      desc: 'پایبندی کامل به ستاپ',
      color: 'text-cyan-400',
      activeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20',
    },
    {
      key: 'Nervous',
      label: 'مضطرب 😰',
      en: 'Nervous',
      desc: 'ترس از ضرر یا شک',
      color: 'text-amber-400',
      activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20',
    },
    {
      key: 'Bored',
      label: 'بی‌حوصله 🥱',
      en: 'Bored',
      desc: 'ورود از سر کسالت',
      color: 'text-indigo-400',
      activeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/20',
    },
    {
      key: 'Aggressive',
      label: 'تهاجمی ⚡',
      en: 'Aggressive',
      desc: 'شتاب‌زده یا انتقام‌جویی',
      color: 'text-rose-400',
      activeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20',
    },
    {
      key: 'Calm',
      label: 'آرام 🧘',
      en: 'Calm',
      desc: 'تمرکز و عدم شتاب',
      color: 'text-emerald-400',
      activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20',
    },
    {
      key: 'FOMO',
      label: 'فومو 🔥',
      en: 'FOMO',
      desc: 'ترس از جا ماندن',
      color: 'text-orange-400',
      activeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm shadow-orange-500/20',
    },
  ];

  // Auto calculate R if entry, TP, and SL are entered
  const handleAutoCalcR = () => {
    const entryNum = parseFloat(entry);
    const tpNum = parseFloat(tp);
    const slNum = parseFloat(sl);

    if (!isNaN(entryNum) && !isNaN(tpNum) && !isNaN(slNum)) {
      const riskDist = Math.abs(entryNum - slNum);
      const rewardDist = Math.abs(tpNum - entryNum);
      if (riskDist > 0) {
        const calculatedR = Number((rewardDist / riskDist).toFixed(2));
        setR(calculatedR.toString());
        sound.playSuccess();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rNum = parseFloat(r) || 0;
    
    const newTrade: TradeItem = {
      id: `trade-${Date.now()}`,
      symbol: symbol.toUpperCase().trim() || 'EUR/USD',
      entry: entry.trim(),
      tp: tp.trim(),
      sl: sl.trim(),
      r: rNum,
      direction,
      sentiment,
      tags: selectedTags,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      notes: notes.trim(),
    };

    sound.playSuccess();
    onSaveTrade(newTrade);
    onClose();
  };

  const rNum = parseFloat(r) || 0;
  const estimatedProfitUSD = rNum * riskValue;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-[420px] bg-[#121620] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto ios-scrollbar"
        dir="rtl"
      >
        {/* iOS Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">ثبت معامله جدید</h3>
              <p className="text-[11px] text-slate-400">ثبت احساسات، نسبت R و سود دلاری</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Sentiment Emotional State Selector */}
          <div className="ios-inset p-3 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-cyan-400" />
                وضعیت روانی در لحظه ورود (Sentiment)
              </label>
              <span className="text-[10px] font-mono font-bold text-slate-400" dir="ltr">
                {sentiment}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {sentimentOptions.map((opt) => {
                const isSelected = sentiment === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setSentiment(opt.key);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ios-btn flex flex-col items-center justify-center ${
                      isSelected
                        ? opt.activeClass
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">{opt.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Multi-Select Selector */}
          <div className="ios-inset p-3 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                دسته‌بندی و سبک معامله (Tags)
              </label>
              <span className="text-[10px] font-mono text-cyan-400 font-bold" dir="ltr">
                {selectedTags.length} انتخاب شده
              </span>
            </div>

            {/* Predefined Category Tags */}
            <div className="flex flex-wrap gap-1.5" dir="ltr">
              {predefinedTags.map((item) => {
                const isSelected = selectedTags.includes(item.tag);
                return (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleToggleTag(item.tag)}
                    className={`px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 transition-all ios-btn ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{item.tag}</span>
                    <span className="font-sans text-[10px] font-normal text-slate-400">
                      ({item.label})
                    </span>
                  </button>
                );
              })}

              {/* Any additional custom tags user added */}
              {selectedTags
                .filter((t) => !predefinedTags.some((pt) => pt.tag === t))
                .map((customTag) => (
                  <button
                    key={customTag}
                    type="button"
                    onClick={() => handleToggleTag(customTag)}
                    className="px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1 bg-purple-500/20 text-purple-300 border-purple-500/50 transition-all ios-btn"
                  >
                    <span>{customTag}</span>
                    <X className="w-3 h-3 text-purple-400" />
                  </button>
                ))}
            </div>

            {/* Add Custom Tag Bar */}
            <div className="flex items-center gap-2 pt-1" dir="ltr">
              <div className="relative flex-1">
                <Hash className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="برچسب دلخواه (مثلاً #fibo, #liquidity)"
                  className="ios-input w-full pl-8 pr-3 py-1.5 text-xs font-mono"
                  dir="ltr"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold shrink-0 transition-all ios-btn"
              >
                + افزودن
              </button>
            </div>
          </div>

          {/* Quick Symbol Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">نماد معاملاتی</label>
            <div className="flex flex-wrap gap-1.5 mb-2" dir="ltr">
              {quickSymbols.map((sym) => (
                <button
                  type="button"
                  key={sym}
                  onClick={() => {
                    sound.playTap();
                    setSymbol(sym);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                    symbol === sym
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="EUR/USD"
              className="ios-input w-full p-3 text-xs font-mono font-bold uppercase"
              dir="ltr"
              required
            />
          </div>

          {/* Direction Buy / Sell */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">جهت موقعیت</label>
            <div className="grid grid-cols-2 gap-2" dir="ltr">
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setDirection('BUY');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                  direction === 'BUY'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'bg-white/5 text-slate-400 border border-white/5'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> BUY (Long)
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setDirection('SELL');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                  direction === 'SELL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 ring-1 ring-rose-500/20'
                    : 'bg-white/5 text-slate-400 border border-white/5'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" /> SELL (Short)
              </button>
            </div>
          </div>

          {/* Entry, TP, SL */}
          <div className="grid grid-cols-3 gap-2" dir="ltr">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">نقطه ورود (Entry)</label>
              <input
                type="number"
                step="any"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="1.0850"
                className="ios-input w-full p-2.5 text-xs font-mono text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] text-emerald-400 mb-1">حد سود (TP)</label>
              <input
                type="number"
                step="any"
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                placeholder="1.0910"
                className="ios-input w-full p-2.5 text-xs font-mono text-emerald-400 text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] text-rose-400 mb-1">حد ضرر (SL)</label>
              <input
                type="number"
                step="any"
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                placeholder="1.0820"
                className="ios-input w-full p-2.5 text-xs font-mono text-rose-400 text-center"
              />
            </div>
          </div>

          {/* R Factor & Auto-calc button */}
          <div className="ios-inset p-3 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">بازدهی معامله (R Multiple):</span>
              <button
                type="button"
                onClick={handleAutoCalcR}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                <Calculator className="w-3 h-3" /> محاسبه از قیمت‌ها
              </button>
            </div>

            <div className="flex items-center gap-3" dir="ltr">
              <input
                type="number"
                step="0.01"
                value={r}
                onChange={(e) => setR(e.target.value)}
                placeholder="+2.00 یا -1.00"
                className="ios-input flex-1 p-2.5 text-sm font-mono font-bold text-center"
                required
              />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans">سود/ضرر دلاری:</span>
                <span className={`text-xs font-mono font-bold ${estimatedProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {estimatedProfitUSD >= 0 ? '+' : ''}${estimatedProfitUSD.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">علت و توضیحات ستاپ</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تست اردر بلاک لندن + شکست ساختار ۱۵ دقیقه"
              className="ios-input w-full p-3 text-xs"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              افزودن پوزیشن به ژورنال
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

