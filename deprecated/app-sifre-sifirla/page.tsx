'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { sifreSifirlaSchema, type SifreSifirlaInput } from '@/lib/validations/password';

export default function SifreSifirlaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<SifreSifirlaInput>({
    tc_kimlik_no: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SifreSifirlaInput, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Değişiklik olduğunda o field'ın hatasını temizle
    if (errors[name as keyof SifreSifirlaInput]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    try {
      // Zod validasyonu
      const validated = sifreSifirlaSchema.parse(formData);

      // API isteği
      const res = await fetch('/api/sifre-sifirla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Şifre sıfırlama isteği gönderilemedi');
      }

      setSuccess(true);
    } catch (err: any) {
      if (err.errors) {
        // Zod validation errors
        const fieldErrors: Partial<Record<keyof SifreSifirlaInput, string>> = {};
        err.errors.forEach((error: any) => {
          const field = error.path[0] as keyof SifreSifirlaInput;
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        setError(err.message || 'Bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Gönderildi</h2>
          <p className="text-gray-600 mb-6">
            Şifre sıfırlama bağlantısı email adresinize gönderildi.
            <br />
            Lütfen gelen kutunuzu kontrol ediniz.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Not:</strong> Bağlantı 1 saat geçerlidir. Eğer email gelmediyse spam klasörünü kontrol ediniz.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Kocaeli İSM Logo */}
          <div className="mx-auto mb-3">
            <img
              src="https://static.fokusistatistik.com/resimler/kism.png"
              alt="Kocaeli İl Sağlık Müdürlüğü"
              className="h-20 mx-auto"
            />
          </div>

          {/* SAHA Logo */}
          <div className="mx-auto mb-4">
            <img
              src="https://static.fokusistatistik.com/resimler/saha.jpg"
              alt="SAHA - Sağlık Hizmetleri Analitiği"
              className="h-24 mx-auto rounded-lg shadow-md"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
          <p className="text-gray-600">
            TC Kimlik No ve email adresinizi girerek şifrenizi sıfırlayabilirsiniz.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="tc_kimlik_no" className="block text-sm font-medium text-gray-700 mb-2">
                TC Kimlik No <span className="text-red-500">*</span>
              </label>
              <input
                id="tc_kimlik_no"
                name="tc_kimlik_no"
                type="text"
                value={formData.tc_kimlik_no}
                onChange={handleChange}
                placeholder="11 haneli TC Kimlik No"
                maxLength={11}
                required
                className={`
                  w-full px-4 py-2 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.tc_kimlik_no ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.tc_kimlik_no && (
                <p className="mt-2 text-sm text-red-600">{errors.tc_kimlik_no}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@saglik.gov.tr"
                required
                className={`
                  w-full px-4 py-2 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.email ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">Güvenlik Bilgisi:</h3>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• Şifre sıfırlama bağlantısı 1 saat geçerlidir</li>
            <li>• Eğer bu talebi siz yapmadıysanız, bu mesajı görmezden gelebilirsiniz</li>
            <li>• Şüpheli bir durum fark ederseniz, lütfen IT destek ile iletişime geçiniz</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
