import React, { useState } from 'react';
import {
  Apple,
  Download,
  Github,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Copy,
  Terminal,
  FolderArchive,
  Loader2,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Share,
  PlusSquare,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { generateAndDownloadIpa, generateProjectZip } from '../../utils/ipaExporter';
import { sound } from '../../utils/audio';

export const DownloadTab: React.FC = () => {
  const [isGeneratingIpa, setIsGeneratingIpa] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [copiedGitCmds, setCopiedGitCmds] = useState(false);
  const [copiedTagCmds, setCopiedTagCmds] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Default to user's exact repository
  const [githubRepoName, setGithubRepoName] = useState(
    'nrmn2ai/first-trading-journal-app-with-google-studio-ai-'
  );

  const sanitizedRepo = githubRepoName.trim() || 'nrmn2ai/first-trading-journal-app-with-google-studio-ai-';
  const repoUrl = `https://github.com/${sanitizedRepo}`;
  const releasesUrl = `https://github.com/${sanitizedRepo}/releases`;
  const actionsUrl = `https://github.com/${sanitizedRepo}/actions`;

  const gitPushCommands = `# ۱. ارسال تغییرات و رفع مشکل lock file به مخزن گیت‌هاب
git remote add origin ${repoUrl}.git 2>/dev/null || git remote set-url origin ${repoUrl}.git
git branch -M main
git add .
git commit -m "fix: resolve dependencies lock file and enable iOS IPA release"
git push -u origin main --force`;

  const gitTagCommands = `# ۲. ایجاد تگ نسخه و فعال‌سازی فوری بیلد Release
git tag -a v1.0.0 -m "Release v1.0.0 - NRMN2AI Trading OS IPA"
git push origin v1.0.0 --force`;

  const handleDownloadIpa = async () => {
    try {
      sound.playTap();
      setIsGeneratingIpa(true);
      setDownloadSuccessMessage(null);
      await generateAndDownloadIpa('NRMN2AI-TradingOS.ipa');
      sound.playSuccess();
      setDownloadSuccessMessage('فایل NRMN2AI-TradingOS.ipa با موفقیت دانلود شد! اکنون می‌توانید با Sideloadly آن را روی آیفون نصب کنید.');
    } catch (err) {
      console.error('Error generating IPA:', err);
    } finally {
      setIsGeneratingIpa(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      sound.playTap();
      setIsGeneratingZip(true);
      setDownloadSuccessMessage(null);
      await generateProjectZip('NRMN2AI-Source-and-Workflow.zip');
      sound.playSuccess();
      setDownloadSuccessMessage('پکیج کامل پروژه و GitHub Actions دانلود شد.');
    } catch (err) {
      console.error('Error generating ZIP:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleCopy = (text: string, type: 'git' | 'tag') => {
    sound.playTap();
    navigator.clipboard.writeText(text);
    if (type === 'git') {
      setCopiedGitCmds(true);
      setTimeout(() => setCopiedGitCmds(false), 2500);
    } else {
      setCopiedTagCmds(true);
      setTimeout(() => setCopiedTagCmds(false), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-2 px-3.5 select-none" dir="rtl">
      {/* Hero Header Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-cyan-950/80 via-slate-900/90 to-purple-950/80 border border-cyan-500/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-400 text-black flex items-center justify-center font-black shadow-lg shadow-cyan-400/30">
                <Apple className="w-6 h-6 fill-black" />
              </div>
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>دانلود فایل IPA و اتصال به GitHub</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    iOS Release
                  </span>
                </h2>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  دانلود مستقیم بسته نصبی آیفون، رفع خطای ورک‌فلو و انتشار خودکار در مخزن
                </p>
              </div>
            </div>
          </div>

          {/* Alert: Fix for GitHub Actions build / lock errors */}
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 leading-relaxed space-y-3 shadow-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold text-white block text-xs">
                  راهنمای رفع ارورهای GitHub Actions (Exit Code 1 و Lock File):
                </span>
                <p className="text-slate-300 text-[11px]">
                  <strong>علت ارور Build Web Application (Exit code 1):</strong> نبودن دستور <code className="text-cyan-300">"build": "vite build"</code> در فایل <code className="text-purple-300">package.json</code> یا عدم تطابق نسخه Node.js در سرور اکشنز.
                </p>
                <p className="text-slate-300 text-[11px]">
                  <strong>راهکار آنی:</strong> ورک‌فلو <code className="text-cyan-300">deploy-ipa-release.yml</code> بازنویسی شد تا اسکریپت بیلد را به صورت خودکار ترمیم کند. کافیست محتوای ورک‌فلو را جایگزین کنید.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center gap-2">
              <a
                href={`https://github.com/${sanitizedRepo}/edit/main/.github/workflows/deploy-ipa-release.yml`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-[11px] flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/20"
              >
                <span>ویرایش مستقیم ورک‌فلو در گیت‌هاب</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href="/deploy-ipa-release.yml"
                download="deploy-ipa-release.yml"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3 h-3 text-purple-400" />
                <span>دانلود ورک‌فلو تصحیح‌شده (.yml)</span>
              </a>

              <a
                href="/package.json"
                download="package.json"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>دانلود package.json</span>
              </a>

              <a
                href="/package-lock.json"
                download="package-lock.json"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>دانلود package-lock.json</span>
              </a>
            </div>
          </div>

          {downloadSuccessMessage && (
            <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-400/50 text-[11px] text-cyan-200 flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Download Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card 1: Direct IPA Download */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-3 relative overflow-hidden group shadow-lg">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Apple className="w-6 h-6 fill-cyan-400" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              NRMN2AI.ipa
            </span>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-white">دانلود مستقیم فایل IPA آیفون</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              بسته استاندارد iOS (.ipa) آماده جهت نصب بر روی تمامی مدل‌های آیفون توسط Sideloadly، AltStore یا TrollStore.
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">iOS 15.0+ Compatible</span>
            <button
              onClick={handleDownloadIpa}
              disabled={isGeneratingIpa}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-black text-xs shadow-lg shadow-cyan-400/25 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingIpa ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال ساخت IPA...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود فوری فایل IPA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Full Source & Workflow ZIP */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-purple-500/30 hover:border-purple-500/60 transition-all space-y-3 relative overflow-hidden shadow-lg">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <FolderArchive className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Project .ZIP
            </span>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-white">دانلود سورس کامل + ورک‌فلو گیت‌هاب</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              شامل سورس کامل، پکیج لاک، فایل <code className="text-purple-300">deploy-ipa-release.yml</code> و پیکربندی Capacitor.
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Full Repository Archive</span>
            <button
              onClick={handleDownloadZip}
              disabled={isGeneratingZip}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingZip ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال ایجاد ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود پروژه (.ZIP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Repository Releases Hub */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-sm font-extrabold text-white">انتشار خودکار در GitHub Releases</h3>
              <p className="text-[11px] text-slate-400">
                مشاهده صفحه رلیزها و اجرای ورک‌فلو برای تولید خودکار فایل IPA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={releasesUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <span>صفحه Releases</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={actionsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-300 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <span>صفحه Actions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Repository Name Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 block">
            آدرس مخزن گیت‌هاب شما:
          </label>
          <div className="flex items-center gap-2" dir="ltr">
            <span className="text-slate-500 text-xs font-mono">https://github.com/</span>
            <input
              type="text"
              value={githubRepoName}
              onChange={(e) => setGithubRepoName(e.target.value)}
              className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Terminal Command 1: Push fixed code */}
        <div className="space-y-2 p-3 rounded-xl bg-black/50 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono text-[10px]">
                ۱
              </span>
              دستور پوش رفع باگ و ثبت package-lock به مخزن (Terminal):
            </span>
            <button
              onClick={() => handleCopy(gitPushCommands, 'git')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              {copiedGitCmds ? (
                <>
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>کپی دستور</span>
                </>
              )}
            </button>
          </div>
          <pre
            className="p-2.5 rounded-lg bg-black/80 font-mono text-[11px] text-cyan-300 overflow-x-auto text-left select-all"
            dir="ltr"
          >
            {gitPushCommands}
          </pre>
        </div>

        {/* Terminal Command 2: Tag v1.0.0 */}
        <div className="space-y-2 p-3 rounded-xl bg-black/50 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono text-[10px]">
                ۲
              </span>
              دستور ساخت Release و انتشار آنی فایل IPA:
            </span>
            <button
              onClick={() => handleCopy(gitTagCommands, 'tag')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              {copiedTagCmds ? (
                <>
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-purple-400" />
                  <span>کپی دستور</span>
                </>
              )}
            </button>
          </div>
          <pre
            className="p-2.5 rounded-lg bg-black/80 font-mono text-[11px] text-purple-300 overflow-x-auto text-left select-all"
            dir="ltr"
          >
            {gitTagCommands}
          </pre>
        </div>
      </div>

      {/* Sideloading & Installation Methods */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>آموزش نصب فایل IPA بر روی آیفون (بدون جیلبریک)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
            <span className="font-bold text-cyan-300 block">روش اول: با Sideloadly (ویندوز و مک)</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ۱. نرم‌افزار Sideloadly را باز کنید و آیفون را با کابل متصل کنید.<br />
              ۲. فایل <code className="text-cyan-300">NRMN2AI-TradingOS.ipa</code> را داخل برنامه بکشید.<br />
              ۳. اپل آیدی خود را وارد کرده و دکمه Start را بزنید.<br />
              ۴. پس از نصب، در آیفون به مسیر: <code className="text-slate-200">Settings &gt; General &gt; VPN &amp; Device Management</code> رفته و روی نام اکانت Trust را بزنید.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
            <span className="font-bold text-purple-300 block">روش دوم: نصب سریع PWA در سافاری (بدون کابل)</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ۱. همین لینک برنامه را در مرورگر <strong>Safari</strong> آیفون باز کنید.<br />
              ۲. دکمه <strong>Share</strong> (مربع با فلش بالا) را لمس کنید.<br />
              ۳. گزینه <strong>Add to Home Screen</strong> (افزودن به صفحه اصلی) را انتخاب کنید.<br />
              ۴. اپلیکیشن با آیکون اختصاصی و بدون نوار آدرس مثل اپ بومی اجرا می‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
