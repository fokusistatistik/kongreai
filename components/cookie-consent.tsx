'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
};

const COOKIE_CONSENT_KEY = 'kongreai_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'kongreai_cookie_preferences';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (!consent) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    localStorage.setItem(COOKIE_CONSENT_KEY + '_timestamp', new Date().toISOString());
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    if (prefs.analytics && typeof window !== 'undefined') {
      console.log('Analytics cookies enabled');
    }

    if (prefs.functional) {
      console.log('Functional cookies enabled');
    }
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      functional: true,
    });
  };

  const acceptEssentialOnly = () => {
    savePreferences({
      essential: true,
      analytics: false,
      functional: false,
    });
  };

  const handleCustomSave = () => {
    savePreferences(preferences);
  };

  if (!showBanner && !showSettings) {
    return null;
  }

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-4 border-blue-600 shadow-2xl animate-slide-up">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Cookie className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Cerez Kullanimi Hakkinda
                </h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Web sitemizde size en iyi deneyimi sunabilmek icin cerezler kullaniyoruz.
                  Zorunlu cerezler sitenin calismasi icin gereklidir ve her zaman aktiftir.
                  Analitik ve islevsel cerezler icin izninize ihtiyacimiz var.
                  Tercihlerinizi dilediginiz zaman degistirebilirsiniz.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                  >
                    Tumunu Kabul Et
                  </button>
                  <button
                    onClick={acceptEssentialOnly}
                    className="px-6 py-2.5 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Sadece Zorunlu Cerezler
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Ayarlar
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Daha fazla bilgi icin{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Gizlilik Politikasi
                  </a>{' '}
                  ve{' '}
                  <a href="/cookie-policy" className="text-blue-600 hover:underline">
                    Cerez Politikasi
                  </a>
                  ni inceleyebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Cerez Tercihleri</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Cerez tercihlerinizi asagidan yonetebilirsiniz. Zorunlu cerezler sitenin
                calismasi icin gereklidir ve kapatilamaz.
              </p>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Zorunlu Cerezler</h3>
                    <p className="text-sm text-gray-600">
                      Bu cerezler web sitesinin duzgun calismasi icin gereklidir.
                      Oturum yonetimi, guvenlik ve temel islevler icin kullanilir.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Her Zaman Aktif
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ornek: Oturum tanimlayicisi, CSRF korumasi, dil tercihi
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Analitik Cerezler</h3>
                    <p className="text-sm text-gray-600">
                      Site kullanimini anlamamiza ve iyilestirmemize yardimci olur.
                      Hangi sayfalarin ziyaret edildigi, ne kadar sure kalindigi gibi
                      anonim veriler toplar.
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ornek: Google Analytics, sayfa goruntuleme istatistikleri
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Islevsel Cerezler</h3>
                    <p className="text-sm text-gray-600">
                      Kisisellestirilmis deneyim saglar. Tercihlerinizi hatirlar,
                      form bilgilerinizi kaydeder ve size ozel icerik gosterir.
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) =>
                          setPreferences({ ...preferences, functional: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ornek: Tema tercihi, dil secimi, form otomatik doldurma
                </p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={handleCustomSave}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Tercihleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
