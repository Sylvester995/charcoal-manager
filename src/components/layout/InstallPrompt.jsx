import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [prompt, setPrompt]   = useState(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Catch the browser's install prompt
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };

    // Hide if already installed
    const installed = window.matchMedia('(display-mode: standalone)').matches;
    if (installed) {
      setInstalled(true);
      return;
    }

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setVisible(false);
    setPrompt(null);
  };

  if (!visible || installed) return null;

  return (
    <div className="fixed top-16 left-4 right-4 md:left-auto md:right-6
      md:w-96 z-50 bg-[#1e1b16] border border-orange-600/40 rounded-2xl
      p-4 shadow-2xl shadow-orange-900/20">

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center
          justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm">
            Install Charcoal Manager
          </div>
          <div className="text-stone-400 text-xs mt-0.5 leading-relaxed">
            Add to your home screen for quick access — works offline too!
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="text-stone-600 hover:text-white transition-colors
            flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleInstall}
          className="flex-1 bg-orange-600 hover:bg-orange-500 text-white
            font-bold py-2.5 rounded-xl text-sm transition-colors
            flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Install App
        </button>
        <button
          onClick={() => setVisible(false)}
          className="px-4 bg-[#302b22] hover:bg-[#3a3222] text-stone-400
            hover:text-white font-medium py-2.5 rounded-xl text-sm
            transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;