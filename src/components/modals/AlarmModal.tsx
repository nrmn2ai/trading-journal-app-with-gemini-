import React, { useState } from 'react';
import { X, Bell, Volume2, Check, Clock, Trash2 } from 'lucide-react';
import { sound } from '../../utils/audio';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarmTime: string;
  onSetAlarm: (time: string) => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  alarmTime,
  onSetAlarm,
}) => {
  const [selectedTime, setSelectedTime] = useState(alarmTime || '11:30');

  if (!isOpen) return null;

  const presets = [
    { label: 'سشن لندن (London Open)', time: '11:30' },
    { label: 'سشن نیویورک (NY Open)', time: '16:30' },
    { label: 'اورلپ لندن و نیویورک', time: '17:00' },
    { label: 'بررسی اخبار مهم تقویم', time: '19:00' },
  ];

  const handleSave = (timeToSet?: string) => {
    const time = timeToSet || selectedTime;
    if (!time) return;
    sound.playSuccess();
    onSetAlarm(time);
    onClose();
  };

  const handleClear = () => {
    sound.playTap();
    onSetAlarm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-[400px] bg-[#121620] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl flex flex-col"
        dir="rtl"
      >
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">آلارم سشن و اخبار مارکت</h3>
              <p className="text-[11px] text-slate-400">هشدار صوتی و تصویری سر ساعت معین</p>
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

        <div className="py-4 space-y-4">
          {/* Time Picker and Test Audio */}
          <div className="flex items-center gap-3" dir="ltr">
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="ios-input flex-1 p-3.5 text-xl font-mono font-bold text-center text-cyan-400"
            />
            <button
              type="button"
              onClick={() => sound.playAlarmTone()}
              className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-bold transition-all"
              title="تست صدای هشدار"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              تست صدا
            </button>
          </div>

          {/* Presets */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2">زمان‌های پیشنهادی سشن‌ها:</span>
            <div className="space-y-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.time}
                  onClick={() => {
                    setSelectedTime(preset.time);
                    handleSave(preset.time);
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    alarmTime === preset.time
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {preset.label}
                  </span>
                  <span className="font-mono font-bold" dir="ltr">
                    {preset.time}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => handleSave()}
            className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            فعالسازی هشدار
          </button>
          {alarmTime && (
            <button
              onClick={handleClear}
              className="py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
