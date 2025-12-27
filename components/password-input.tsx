'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { sifreGucuHesapla } from '@/app/lib/validations/password';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  showStrengthMeter?: boolean;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = 'Şifrenizi giriniz',
  label,
  showStrengthMeter = false,
  error,
  required = false,
  autoComplete = 'current-password',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<{
    skor: number;
    seviye: 'zayif' | 'orta' | 'guclu';
    mesajlar: string[];
  } | null>(null);

  useEffect(() => {
    if (showStrengthMeter && value) {
      setStrength(sifreGucuHesapla(value));
    } else {
      setStrength(null);
    }
  }, [value, showStrengthMeter]);

  const getStrengthColor = () => {
    if (!strength) return '';
    switch (strength.seviye) {
      case 'zayif':
        return 'bg-red-500';
      case 'orta':
        return 'bg-yellow-500';
      case 'guclu':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    if (!strength) return '';
    switch (strength.seviye) {
      case 'zayif':
        return 'Zayıf';
      case 'orta':
        return 'Orta';
      case 'guclu':
        return 'Güçlü';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-2 pr-12 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Şifre Gücü Göstergesi */}
      {showStrengthMeter && value && strength && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: `${strength.skor}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 min-w-[50px]">
              {getStrengthText()}
            </span>
          </div>

          {/* Politika Kuralları */}
          <ul className="text-xs space-y-1">
            {strength.mesajlar.map((mesaj, index) => (
              <li
                key={index}
                className={`
                  ${mesaj.startsWith('✓') ? 'text-green-600' : ''}
                  ${mesaj.startsWith('✗') ? 'text-red-600' : ''}
                  ${mesaj.startsWith('○') ? 'text-gray-500' : ''}
                `}
              >
                {mesaj}
              </li>
            ))}
            {value.length < 8 && (
              <li className="text-red-600">✗ En az 8 karakter gerekli</li>
            )}
          </ul>
        </div>
      )}

      {/* Hata Mesajı */}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
