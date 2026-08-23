import React, { useState } from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  Copy,
  Terminal,
  Sparkles,
  Zap
} from 'lucide-react';

interface ExtensionInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionInstallModal: React.FC<ExtensionInstallModalProps> = ({ isOpen, onClose }) => {
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'edge' | 'firefox' | 'safari'>('chrome');
  const [copiedPath, setCopiedPath] = useState(false);

  if (!isOpen) return null;

  const copyExtensionFolder = () => {
    navigator.clipboard.writeText('x:\\Rakshasutra\\extension');
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 dark:bg-slate-950 border-2 border-cyan-500/60 rounded-3xl shadow-2xl overflow-hidden font-mono text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>UNIVERSAL MANIFEST V3 EXTENSION</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            RakshaSutra AI Browser Shield
          </h2>

          <p className="text-xs text-slate-400 max-w-lg mx-auto font-sans">
            Real-time zero-day phishing interception, fake banking APK malware guard, and traffic light badges directly in your browser.
          </p>

          {/* Browser Selector Tabs */}
          <div className="flex items-center justify-center gap-2 pt-3">
            {[
              { id: 'chrome', name: 'Chrome / Brave', tag: 'Chromium' },
              { id: 'edge', name: 'Microsoft Edge', tag: 'Edge' },
              { id: 'firefox', name: 'Mozilla Firefox', tag: 'Gecko' },
              { id: 'safari', name: 'Apple Safari', tag: 'WebKit' }
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBrowser(b.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedBrowser === b.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Key Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Pre-Navigation Block
              </span>
              <p className="text-[11px] text-slate-400 font-sans">
                Halts scam websites before the connection even opens.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Download Guard
              </span>
              <p className="text-[11px] text-slate-400 font-sans">
                Catches trojan APKs & disguised ransomware payloads.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> In-Page Link Badges
              </span>
              <p className="text-[11px] text-slate-400 font-sans">
                Warns on WhatsApp Web, Gmail, and social media links.
              </p>
            </div>
          </div>

          {/* Step-by-Step Installation Instructions */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>How to Install in {selectedBrowser === 'chrome' ? 'Google Chrome & Brave' : selectedBrowser === 'edge' ? 'Microsoft Edge' : selectedBrowser === 'firefox' ? 'Mozilla Firefox' : 'Apple Safari'}:</span>
            </h4>

            {selectedBrowser === 'chrome' && (
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside font-sans">
                <li>
                  Open Chrome and navigate to <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">chrome://extensions</code>
                </li>
                <li>
                  Toggle on the <strong>Developer mode</strong> switch in the top right corner.
                </li>
                <li>
                  Click the <strong>"Load unpacked"</strong> button in the top left.
                </li>
                <li>
                  Select the extension directory from your project.
                </li>
              </ol>
            )}

            {selectedBrowser === 'edge' && (
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside font-sans">
                <li>
                  Open Microsoft Edge and navigate to <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">edge://extensions</code>
                </li>
                <li>
                  Enable <strong>Developer mode</strong> in the left sidebar.
                </li>
                <li>
                  Click <strong>"Load unpacked"</strong> and select the extension folder.
                </li>
              </ol>
            )}

            {selectedBrowser === 'firefox' && (
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside font-sans">
                <li>
                  Open Firefox and navigate to <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">about:debugging#/runtime/this-firefox</code>
                </li>
                <li>
                  Click <strong>"Load Temporary Add-on..."</strong>.
                </li>
                <li>
                  Select <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">manifest.json</code> from the extension folder.
                </li>
              </ol>
            )}

            {selectedBrowser === 'safari' && (
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside font-sans">
                <li>
                  Convert the extension with Apple Xcode CLI: <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">xcrun safari-web-extension-converter extension/</code>
                </li>
                <li>
                  Build and run the project in Xcode to install to Safari on macOS & iOS.
                </li>
              </ol>
            )}

            {/* Folder Path Copy Bar */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 truncate">
                Folder: <strong className="text-cyan-300">extension/</strong>
              </span>
              <button
                onClick={copyExtensionFolder}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedPath ? 'Copied!' : 'Copy Path'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>100% Free & Open-Source Security Engine</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black hover:bg-cyan-400 transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
