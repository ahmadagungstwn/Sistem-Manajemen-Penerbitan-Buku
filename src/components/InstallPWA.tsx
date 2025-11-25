import { useState } from "react";
import { useInstallPWA } from "../hooks/useInstallPWA";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const { isInstallable, installApp } = useInstallPWA();
  const [showPrompt, setShowPrompt] = useState(true);

  if (!isInstallable || !showPrompt) return null;

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-white rounded-lg shadow-2xl p-4 z-50 border border-gray-200 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Tutup"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-indigo-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Install SIM Buku</h3>
          <p className="text-sm text-gray-600 mb-3">
            Install aplikasi untuk akses lebih cepat dan bisa digunakan offline
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Install Sekarang
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
