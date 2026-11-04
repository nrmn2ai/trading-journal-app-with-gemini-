import React, { useState } from 'react';
import {
  X,
  Share,
  PlusSquare,
  Smartphone,
  CheckCircle,
  Download,
  Apple,
  FileCode,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Terminal,
  FolderArchive,
  Loader2,
  Github,
  GitBranch,
  GitPullRequest,
  ArrowRight,
  UploadCloud,
  AlertTriangle,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { generateIpaFile, generateIOSProjectZip, triggerDownload } from '../../utils/ipaExporter';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: TabType;
}

export type TabType = 'download_ipa' | 'github_sync' | 'pwa_safari' | 'sideload_guide';

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'download_ipa',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isGeneratingIpa, setIsGeneratingIpa] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedGitCmds, setCopiedGitCmds] = useState(false);
  const [copiedTagCmds, setCopiedTagCmds] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // GitHub user repo state
  const [githubRepoName, setGithubRepoName] = useState('nrmn2ai/first-trading-journal-app-with-google-studio-ai-');

  if (!isOpen) return null;

  const sanitizedRepo = githubRepoName.trim() || 'nrmn2ai/first-trading-journal-app-with-google-studio-ai-';
  const repoUrl = `https://github.com/${sanitizedRepo}`;
  const releasesUrl = `https://github.com/${sanitizedRepo}/releases`;

  const gitPushCommands = `# ۱. اتصال و پوش تغییرات به مخزن گیت‌هاب شما
git remote add origin ${repoUrl}.git 2>/dev/null || git remote set-url origin ${repoUrl}.git
git branch -M main
git add .
git commit -m "fix: resolve dependencies lock file and trigger IPA release"
git push -u origin main --force`;

  const gitTagCommands = `# ۲. ساخت برچسب نسخه جدید برای فعال‌سازی اتوماتیک GitHub Actions
git tag -a v1.0.0 -m "Release v1.0.0 with IPA"
git push origin v1.0.0 --force`;

  const handleDownloadIpa = async () => {
    try {
      sound.playTap();
      setIsGeneratingIpa(true);
      setDownloadSuccessMessage(null);
      const ipaBlob = await generateIpaFile();
      triggerDownload(ipaBlob, 'NRMN2AI-TradingOS.ipa');
      sound.playSuccess();
      setDownloadSuccessMessage('فایل NRMN2AI-TradingOS.ipa با موفقیت دانلود شد!');
      setTimeout(() => setDownloadSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to generate IPA', err);
    } finally {
      setIsGeneratingIpa(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      sound.playTap();
      setIsGeneratingZip(true);
      setDownloadSuccessMessage(null);
      const zipBlob = await generateIOSProjectZip();
      triggerDownload(zipBlob, 'NRMN2AI-iOS-Xcode-Package.zip');
      sound.playSuccess();
      setDownloadSuccessMessage('پکیج کامل پروژه iOS و ورک‌فلو گیت‌هاب (.zip) با موفقیت دانلود شد!');
      setTimeout(() => setDownloadSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to generate ZIP', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleCopyUrl = () => {
    sound.playTap();
    const appUrl = window.location.href;
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyGitCommands = () => {
    sound.playTap();
    navigator.clipboard.writeText(gitPushCommands);
    setCopiedGitCmds(true);
    setTimeout(() => setCopiedGitCmds(false), 2500);
  };

  const handleCopyTagCommands = () => {
    sound.playTap();
    navigator.clipboard.writeText(gitTagCommands);
    setCopiedTagCmds(true);
    setTimeout(() => setCopiedTagCmds(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-[530px] max-h-[92vh] bg-[#0e121a] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/25">
              <div className="w-full h-full bg-[#0e121a] rounded-[14px] flex items-center justify-center">
                <Apple className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">دانلود IPA و انتشار در GitHub</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  iOS + CI/CD
                </span>
              </div>
              <p className="text-[11px] text-slate-400">دانلود مستقیم فایل IPA یا استقرار خودکار در Releases گیت‌هاب</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success toast if triggered */}
        {downloadSuccessMessage && (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}

        {/* 4 Tabs Bar */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-2xl my-3 border border-white/5 shrink-0 text-center">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('download_ipa');
            }}
            className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'download_ipa'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>دانلود IPA</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('github_sync');
            }}
            className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'github_sync'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5 shrink-0" />
            <span>گیت‌هاب Release</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('pwa_safari');
            }}
            className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'pwa_safari'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>نصب Safari</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('sideload_guide');
            }}
            className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'sideload_guide'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>ساین و نصب</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="overflow-y-auto space-y-3.5 py-1 pr-0.5 ios-scrollbar text-slate-300 flex-1">
          {/* TAB 1: DOWNLOAD IPA */}
          {activeTab === 'download_ipa' && (
            <div className="space-y-3 animate-fade-in">
              {/* Option 1: Direct .ipa Download */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-900/60 to-purple-950/40 border border-cyan-500/40 relative overflow-hidden group shadow-lg shadow-cyan-950/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                      <Apple className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white">فایل رسمی NRMN2AI-TradingOS.ipa</h4>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          v1.0.0
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                        بسته استاندارد iOS (.ipa) آماده جهت نصب بر روی آیفون توسط Sideloadly، AltStore یا TrollStore.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono">
                    <CheckCircle className="w-3 h-3 text-cyan-400" />
                    <span>فرمت استاندارد iOS Payload IPA</span>
                  </div>
                  <button
                    onClick={handleDownloadIpa}
                    disabled={isGeneratingIpa}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 active:scale-95 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingIpa ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        در حال ساخت پکیج IPA...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        دانلود مستقیم فایل IPA
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Option 2: Full Source & GitHub Workflow ZIP */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
                    <FolderArchive className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">پکیج کامل سورس پروژه + ورک‌فلو گیت‌هاب (.zip)</h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Capacitor + GitHub Actions
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      شامل پروژه کامل، فایل ورک‌فلو <code>deploy-ipa-release.yml</code> و پیکربندی Capacitor iOS جهت استقرار در گیت‌هاب.
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-500 font-mono">Format: .zip Package</span>
                      <button
                        onClick={handleDownloadZip}
                        disabled={isGeneratingZip}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isGeneratingZip ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            در حال ایجاد ZIP...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            دانلود پکیج (.ZIP)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Switch to GitHub Sync Tab */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900/60 border border-purple-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-[11px] text-purple-200">
                    می‌خواهید با هر بار آپدیت، فایل IPA در صفحه Release گیت‌هاب قرار گیرد؟
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveTab('github_sync');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[11px] font-bold whitespace-nowrap"
                >
                  مشاهده راهنما و دستورات ←
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GITHUB SYNC & WORKFLOW (USER REQUEST) */}
          {activeTab === 'github_sync' && (
            <div className="space-y-3.5 animate-fade-in text-xs">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900/60 to-cyan-950/40 border border-purple-500/40 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Github className="w-5 h-5 text-purple-400" />
                  <span>انتشار خودکار IPA در صفحه GitHub Releases با Workflow</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  فایل جریان کاری <code>.github/workflows/deploy-ipa-release.yml</code> در پروژه تنظیم شده است. با پوش به مخزن گیت‌هاب، سرورهای ابری مک‌او‌اس اپل (macOS-14) به صورت خودکار پروژه را بیلد کرده و فایل <strong>NRMN2AI-TradingOS.ipa</strong> را در صفحه Release مخزن شما آپلود می‌کنند!
                </p>
              </div>

              {/* Alert for Dependencies lock file error & exit code 1 */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-[11px] text-amber-200">
                <div className="flex items-center gap-2 text-white font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>راهنمای رفع ارورهای Build Web Application (Exit code 1) و Lock file:</span>
                </div>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  ارور <code className="text-rose-300 font-mono">Exit code 1</code> در بخش Build Web به دلیل نبودن اسکریپت build در <code className="text-purple-300">package.json</code> یا ورژن قدیمی Node.js رخ می‌دهد. فایل ورک‌فلو تصحیح شد تا به صورت خودکار این اسکریپت را تزریق کند.
                </p>
                <div className="pt-1 flex flex-wrap gap-2">
                  <a
                    href={`https://github.com/${sanitizedRepo}/edit/main/.github/workflows/deploy-ipa-release.yml`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[10.5px] flex items-center gap-1"
                  >
                    <span>ویرایش آنلاین در گیت‌هاب</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="/deploy-ipa-release.yml"
                    download="deploy-ipa-release.yml"
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-[10.5px] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3 text-purple-400" />
                    <span>دانلود deploy-ipa-release.yml</span>
                  </a>
                  <a
                    href="/package.json"
                    download="package.json"
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-[10.5px] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3 text-emerald-400" />
                    <span>دانلود package.json</span>
                  </a>
                  <a
                    href="/package-lock.json"
                    download="package-lock.json"
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-[10.5px] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>دانلود package-lock.json</span>
                  </a>
                </div>
              </div>

              {/* Repo Name Input */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  نام مخزن گیت‌هاب شما (Username/Repository):
                </label>
                <div className="flex items-center gap-2" dir="ltr">
                  <span className="text-slate-500 text-xs font-mono">https://github.com/</span>
                  <input
                    type="text"
                    value={githubRepoName}
                    onChange={(e) => setGithubRepoName(e.target.value)}
                    placeholder="nrmn2ai/nrmn2ai-trading-os"
                    className="flex-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Step 1: Git Push */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono text-[10px]">
                      ۱
                    </span>
                    دستورات اتصال و ارسال به گیت‌هاب (Terminal):
                  </span>
                  <button
                    onClick={handleCopyGitCommands}
                    className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    {copiedGitCmds ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-cyan-400" />
                        <span>کپی دستورات</span>
                      </>
                    )}
                  </button>
                </div>
                <pre
                  className="p-2.5 rounded-lg bg-black/60 font-mono text-[10px] text-cyan-300 overflow-x-auto text-left select-all"
                  dir="ltr"
                >
                  {gitPushCommands}
                </pre>
              </div>

              {/* Step 2: Trigger GitHub Release */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono text-[10px]">
                      ۲
                    </span>
                    ارسال تگ نسخه جهت فعال‌سازی ساخت و انتشار IPA:
                  </span>
                  <button
                    onClick={handleCopyTagCommands}
                    className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    {copiedTagCmds ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-cyan-400" />
                        <span>کپی دستور تگ</span>
                      </>
                    )}
                  </button>
                </div>
                <pre
                  className="p-2.5 rounded-lg bg-black/60 font-mono text-[10px] text-purple-300 overflow-x-auto text-left select-all"
                  dir="ltr"
                >
                  {gitTagCommands}
                </pre>
              </div>

              {/* Step 3: Link to Releases page */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-emerald-300 text-xs">دانلود IPA از صفحه Releases گیت‌هاب:</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    پس از اجرای دستورات، فایل در بخش Assets صفحه Releases آماده دانلود است.
                  </p>
                </div>
                <a
                  href={releasesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 shrink-0"
                >
                  <span>صفحه Releases</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Direct Actions in this tab */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={handleDownloadIpa}
                  disabled={isGeneratingIpa}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  دانلود مستقیم همین نسخه (.ipa)
                </button>
                <button
                  onClick={handleDownloadZip}
                  disabled={isGeneratingZip}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  دانلود سورس ZIP
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SAFARI PWA DIRECT INSTALL */}
          {activeTab === 'pwa_safari' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] leading-relaxed">
                ✨ <strong>روش پیشنهادی اپل بدون نیاز به کامپیوتر:</strong> بدون نیاز به فایل IPA یا کامپیوتر، با ۳ کلیک ساده اپلیکیشن را تمام‌صفحه روی آیفون نصب کنید:
              </div>

              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center shrink-0">
                  ۱
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-xs mb-0.5">کلیک روی دکمه Share در مرورگر Safari</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                    در نوار پایین یا بالای مرورگر آیکون اشتراک‌گذاری <Share className="w-3.5 h-3.5 text-cyan-400" /> را لمس کنید.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center shrink-0">
                  ۲
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-xs mb-0.5">انتخاب گزینه Add to Home Screen</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                    در منوی باز شده گزینه <PlusSquare className="w-3.5 h-3.5 text-cyan-400" /> «افزودن به صفحه اصلی» را انتخاب نمایید.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center shrink-0">
                  ۳
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-xs mb-0.5">تایید با کلیک روی Add</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                    آیکون NRMN2AI روی صفحه آیفون قرار می‌گیرد و به صورت ۱۰۰٪ آفلاین کار می‌کند!
                  </p>
                </div>
              </div>

              {/* Copy URL Button */}
              <button
                onClick={handleCopyUrl}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copiedUrl ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">آدرس کپی شد! در مرورگر Safari آیفون باز کنید</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>کپی آدرس سایت جهت باز کردن در Safari آیفون</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 4: SIDELOAD GUIDE */}
          {activeTab === 'sideload_guide' && (
            <div className="space-y-3 animate-fade-in text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  آموزش نصب فایل IPA با نرم‌افزار Sideloadly (ویندوز یا مک):
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-300 leading-relaxed pr-1">
                  <li>
                    نرم‌افزار رایگان <strong>Sideloadly</strong> را از سایت{' '}
                    <a
                      href="https://sideloadly.io"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline inline-flex items-center gap-0.5"
                    >
                      sideloadly.io <ExternalLink className="w-2.5 h-2.5" />
                    </a>{' '}
                    دانلود و اجرا کنید.
                  </li>
                  <li>آیفون را با کابل به کامپیوتر وصل کنید.</li>
                  <li>
                    فایل <strong>NRMN2AI-TradingOS.ipa</strong> را با کشیدن و رها کردن (Drag & Drop) درون نرم‌افزار قرار دهید.
                  </li>
                  <li>اپل آیدی (Apple ID) خود را وارد کنید و روی Start بزنید.</li>
                  <li>
                    پس از اتمام نصب، در تنظیمات آیفون مجوز اجرا صادر کنید:
                    <div className="mt-1 p-2 rounded-lg bg-black/40 font-mono text-[10px] text-cyan-300 ltr text-left">
                      Settings &gt; General &gt; VPN &amp; Device Management &gt; Trust [Your Apple ID]
                    </div>
                  </li>
                  <li>در iOS 16+ حالت Developer Mode را در Settings &gt; Privacy &amp; Security روشن کنید.</li>
                </ol>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 text-[11px] flex items-center justify-between">
                <span>دانلود مستقیم فایل IPA برای سایدلود:</span>
                <button
                  onClick={handleDownloadIpa}
                  disabled={isGeneratingIpa}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-black font-extrabold text-[11px] shadow hover:bg-cyan-400 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  دانلود فایل IPA
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/5 mt-2 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
