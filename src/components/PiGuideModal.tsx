import React from 'react';
import { Server, Wifi, Smartphone, Monitor, Terminal, Shield, CheckCircle, Copy, Check } from 'lucide-react';
import { sound } from '../utils/sound';

interface PiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PiGuideModal: React.FC<PiGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    sound.playTap();
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div
        id="pi-guide-dialog"
        className="bg-yellow-50 w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-4 border-yellow-300 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-yellow-200">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-pink-500 text-white flex items-center justify-center font-black text-3xl shadow-md transform -rotate-3">
              🍓
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-900 italic tracking-tight">
                Raspberry Pi 5 Setup
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                Host privately on your home Wi-Fi with zero subscriptions
              </p>
            </div>
          </div>
          <button
            id="btn-close-pi-guide"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border-2 border-slate-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-5 text-sm text-slate-700">
          {/* Section 1: Local Access URLs */}
          <div className="p-4 rounded-3xl bg-white border-b-4 border-r-2 border-yellow-400 border-t-2 border-l-2 border-t-yellow-100 border-l-yellow-100 shadow-2xs">
            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-2 text-sm sm:text-base">
              <Wifi className="w-5 h-5 text-indigo-600" />
              1. Accessing from Family Phones & Tablets
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Once running on your Raspberry Pi 5, any phone, iPad, or laptop connected to your home Wi-Fi can open the app in their browser using:
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-yellow-50 p-2.5 rounded-2xl border-2 border-yellow-200 flex items-center justify-between font-mono text-xs text-slate-800">
                <span className="font-bold">http://raspberrypi.local:3000</span>
                <button
                  onClick={() => copyToClipboard('http://raspberrypi.local:3000', 'url1')}
                  className="text-indigo-600 hover:text-indigo-800 font-sans text-xs font-black flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-xl border border-indigo-200 shadow-2xs"
                >
                  {copied === 'url1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'url1' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex-1 bg-yellow-50 p-2.5 rounded-2xl border-2 border-yellow-200 flex items-center justify-between font-mono text-xs text-slate-800">
                <span className="font-bold">http://&lt;PI-IP&gt;:3000</span>
                <button
                  onClick={() => copyToClipboard('hostname -I', 'cmd1')}
                  className="text-indigo-600 hover:text-indigo-800 font-sans text-xs font-black flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-xl border border-indigo-200 shadow-2xs"
                >
                  {copied === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Find IP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Mobile Add to Home Screen (PWA / App Icon) */}
          <div className="p-4 rounded-3xl bg-white border-b-4 border-r-2 border-pink-400 border-t-2 border-l-2 border-t-pink-100 border-l-pink-100 shadow-2xs">
            <h3 className="font-black text-pink-700 flex items-center gap-2 mb-2 text-sm sm:text-base">
              <Smartphone className="w-5 h-5 text-pink-600" />
              2. Add to Kids & Parents Phones (App Icon)
            </h3>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc pl-5 font-medium">
              <li>
                <strong>On iPhone / iPad (Safari):</strong> Tap the <em>Share button</em> (square with arrow) → Tap <em>"Add to Home Screen"</em>.
              </li>
              <li>
                <strong>On Android (Chrome):</strong> Tap the <em>3-dots menu</em> at top right → Tap <em>"Add to Home Screen"</em> or <em>"Install App"</em>.
              </li>
              <li>
                This provides an instant full-screen app experience with offline capability and snappy touch controls.
              </li>
            </ul>
          </div>

          {/* Section 3: 24/7 Autostart on Raspberry Pi OS */}
          <div className="p-4 rounded-3xl bg-white border-b-4 border-r-2 border-indigo-400 border-t-2 border-l-2 border-t-indigo-100 border-l-indigo-100 shadow-2xs">
            <h3 className="font-black text-indigo-900 flex items-center gap-2 mb-2 text-sm sm:text-base">
              <Terminal className="w-5 h-5 text-indigo-600" />
              3. Keeping It Running 24/7 on Pi OS
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-2">
              Run this command on your Raspberry Pi terminal to launch the compiled background service:
            </p>
            <div className="bg-slate-900 text-yellow-300 p-3 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
              <code>npm run build && node dist/server.cjs</code>
            </div>
          </div>

          {/* Section 4: Data Privacy Guarantee */}
          <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-emerald-900 text-xs sm:text-sm">
                100% Local Data Privacy & Security
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed font-bold">
                All chore logs, kid profiles, reasons, and star balances reside strictly inside your home network.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-2 border-yellow-200 text-right">
          <button
            id="btn-close-pi-guide-bottom"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="px-6 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-sm transition-all shadow-md cursor-pointer"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
