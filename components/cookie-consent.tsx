'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';

/**
 * GDPR-compliant Cookie Consent Component
 *
 * Features:
 * - First-time visitor consent banner
 * - Essential cookies (always enabled)
 * - Analytics cookies (optional)
 * - Functional cookies (optional)
 * - Preference persistence in localStorage
 * - Settings modal for detailed preferences
 */

type CookiePreferences = {
  essential: boolean; // Always true, required for site functionality
  analytics: boolean; // Google Analytics, tracking
  functional: boolean; // User preferences, language, theme
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
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (!consent) {
      // First-time visitor, show banner after 1 second
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (savedPreferences) {
      // Load saved preferences
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

    // Initialize analytics if enabled
    if (prefs.analytics && typeof window !== 'undefined') {
      // Google Analytics initialization would go here
      console.log('Analytics cookies enabled');
    }

    // Initialize functional cookies if enabled
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
      {/* Cookie Consent Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-4 border-blue-600 shadow-2xl animate-slide-up">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Cookie className="w-8 h-8 text-blue-600" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Çerez Kullan1m1 Hakk1nda
                </h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Web sitemizde size en iyi deneyimi sunabilmek için çerezler kullan1yoruz.
                  Zorunlu çerezler sitenin çal1_mas1 için gereklidir ve her zaman aktiftir.
                  Analitik ve i_levsel çerezler için izninize ihtiyac1m1z var.
                  Tercihlerinizi dilediiniz zaman dei_tirebilirsiniz.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                  >
                    Tümünü Kabul Et
                  </button>
                  <button
                    onClick={acceptEssentialOnly}
                    className="px-6 py-2.5 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Sadece Zorunlu Çerezler
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
                  Daha fazla bilgi için{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Gizlilik Politikas1
                  </a>{' '}
                  ve{' '}
                  <a href="/cookie-policy" className="text-blue-600 hover:underline">
                    Çerez Politikas1
                  </a>
                  'n1 inceleyebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Çerez Tercihleri</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Çerez tercihlerinizi a_a1dan yönetebilirsiniz. Zorunlu çerezler sitenin
                çal1_mas1 için gereklidir ve kapat1lamaz.
              </p>

              {/* Essential Cookies */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Zorunlu Çerezler</h3>
                    <p className="text-sm text-gray-600">
                      Bu çerezler web sitesinin düzgün çal1_mas1 için gereklidir.
                      Oturum yönetimi, güvenlik ve temel i_levler için kullan1l1r.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Her Zaman Aktif
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Örnek: Oturum tan1mlay1c1s1, CSRF korumas1, dil tercihi
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Analitik Çerezler</h3>
                    <p className="text-sm text-gray-600">
                      Site kullan1m1n1 anlamam1za ve iyile_tirmemize yard1mc1 olur.
                      Hangi sayfalar1n ziyaret edildii, ne kadar süre kal1nd11 gibi
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
                  Örnek: Google Analytics, sayfa görüntüleme istatistikleri
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">0_levsel Çerezler</h3>
                    <p className="text-sm text-gray-600">
                      Ki_iselle_tirilmi_ deneyim salar. Tercihlerinizi hat1rlar,
                      form bilgilerinizi kaydeder ve size özel içerik gösterir.
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
                  Örnek: Tema tercihi, dil seçimi, form otomatik doldurma
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                0ptal
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
