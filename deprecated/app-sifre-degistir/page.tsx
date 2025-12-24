'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import PasswordInput from '@/components/password-input';
import { sifreDegistirSchema, type SifreDegistirInput } from '@/lib/validations/password';

export default function SifreDegistirPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<SifreDegistirInput>({
    eski_sifre: '',
    yeni_sifre: '',
    yeni_sifre_tekrar: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SifreDegistirInput, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Değişiklik olduğunda o field'ın hatasını temizle
    if (errors[name as keyof SifreDegistirInput]) {
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
      const validated = sifreDegistirSchema.parse(formData);

      // API isteği
      const res = await fetch('/api/sifre-degistir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Şifre değiştirilemedi');
      }

      setSuccess(true);

      // 2 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      if (err.errors) {
        // Zod validation errors
        const fieldErrors: Partial<Record<keyof SifreDegistirInput, string>> = {};
        err.errors.forEach((error: any) => {
          const field = error.path[0] as keyof SifreDegistirInput;
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
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Şifre Değiştirildi</h2>
          <p className="text-gray-600 mb-4">
            Şifreniz başarıyla değiştirildi. Ana sayfaya yönlendiriliyorsunuz...
          </p>
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Şifrenizi Değiştirin</h1>
          <p className="text-gray-600">
            Güvenliğiniz için ilk girişte şifrenizi değiştirmeniz gerekmektedir.
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
            <PasswordInput
              id="eski_sifre"
              name="eski_sifre"
              value={formData.eski_sifre}
              onChange={handleChange}
              label="Mevcut Şifre"
              placeholder="Geçici şifrenizi giriniz"
              required
              error={errors.eski_sifre}
              autoComplete="current-password"
            />

            <PasswordInput
              id="yeni_sifre"
              name="yeni_sifre"
              value={formData.yeni_sifre}
              onChange={handleChange}
              label="Yeni Şifre"
              placeholder="Yeni şifrenizi giriniz"
              required
              showStrengthMeter
              error={errors.yeni_sifre}
              autoComplete="new-password"
            />

            <PasswordInput
              id="yeni_sifre_tekrar"
              name="yeni_sifre_tekrar"
              value={formData.yeni_sifre_tekrar}
              onChange={handleChange}
              label="Yeni Şifre (Tekrar)"
              placeholder="Yeni şifrenizi tekrar giriniz"
              required
              error={errors.yeni_sifre_tekrar}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Değiştiriliyor...' : 'Şifremi Değiştir'}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Şifre Politikası:</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Minimum 8 karakter</li>
            <li>• En az 1 büyük harf</li>
            <li>• En az 1 küçük harf</li>
            <li>• En az 1 rakam</li>
            <li>• Özel karakter önerilir (güvenlik için)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
