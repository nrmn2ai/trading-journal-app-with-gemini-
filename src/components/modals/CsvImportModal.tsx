import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { sound } from '../../utils/audio';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCsvText: (text: string) => void;
  onImportJsonFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJson: () => void;
  onResetAll: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportCsvText,
  onImportJsonFile,
  onExportJson,
  onResetAll,
}) => {
  const [csvRawText, setCsvRawText] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleCsvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvRawText.trim()) return;
    sound.playSuccess();
    onImportCsvText(csvRawText);
    setCsvRawText('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        sound.playSuccess();
        onImportCsvText(text);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-[420px] bg-[#121620] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto ios-scrollbar"
        dir="rtl"
      >
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">مدیریت داده‌ها و CSV</h3>
              <p className="text-[11px] text-slate-400">درون‌ریزی معاملات و پشتیبان‌گیری</p>
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
          {/* CSV Paste Text Form */}
          <form onSubmit={handleCsvSubmit} className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              ورود سریع متنی یا CSV (فرمت: SYMBOL, PROFIT)
            </label>
            <textarea
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              placeholder="EURUSD, 450&#10;BTCUSD, -200&#10;XAUUSD, 620"
              className="ios-input w-full p-3 h-24 text-xs font-mono"
              dir="ltr"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Upload className="w-3.5 h-3.5" />
                ثبت در روز جاری
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                انتخاب فایل
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </form>

          {/* Backup & Restore JSON */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <span className="text-xs font-bold text-slate-400 block">پشتیبان‌گیری کامل (JSON):</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  onExportJson();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                دانلود فایل JSON
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                بازیابی JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportJsonFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Danger Zone: Reset All Data */}
          <div className="pt-2 border-t border-white/5">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                پاکسازی کل داده‌های ژورنال
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-2">
                <p className="text-xs font-bold text-rose-300">آیا مطمئن هستید؟ تمام ۶۰ روز پاک خواهد شد!</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playAlarmTone();
                      onResetAll();
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold"
                  >
                    بله، پاکسازی کامل
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="py-2 px-3 rounded-lg bg-white/10 text-slate-300 text-xs font-medium"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
