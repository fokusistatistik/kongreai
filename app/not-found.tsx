import Link from 'next/link';
import { Home, Search, FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[150px] font-bold text-blue-600/10 select-none">
              404
            </div>
            <FileQuestion className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sayfa Bulunamadı
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm w-full sm:w-auto justify-center"
          >
            <Home className="h-5 w-5" />
            Ana Sayfaya Dön
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
            Geri Dön
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Faydalı Bağlantılar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <Home className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Ana Sayfa</span>
            </Link>

            <Link
              href="/#etkinlikler"
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <Search className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Etkinlikler</span>
            </Link>

            <Link
              href="/hakkimizda"
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <FileQuestion className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Hakkımızda</span>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500">
          Sorun devam ederse lütfen{' '}
          <a href="mailto:destek@kongreai.com" className="text-blue-600 hover:underline">
            destek@kongreai.com
          </a>{' '}
          adresinden bizimle iletişime geçin.
        </p>
      </div>
    </div>
  );
}
