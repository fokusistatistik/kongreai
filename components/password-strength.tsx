import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const strength = passedChecks === 0 ? 'none' :
                   passedChecks <= 2 ? 'weak' :
                   passedChecks === 3 ? 'medium' : 'strong';

  const strengthColors = {
    none: 'bg-gray-200',
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const strengthTexts = {
    none: '',
    weak: 'Zayıf',
    medium: 'Orta',
    strong: 'Güçlü',
  };

  const strengthTextColors = {
    none: 'text-gray-500',
    weak: 'text-red-600',
    medium: 'text-yellow-600',
    strong: 'text-green-600',
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Meter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
            style={{ width: `${(passedChecks / 4) * 100}%` }}
            role="progressbar"
            aria-valuenow={passedChecks}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label="Şifre gücü"
          />
        </div>
        <span className={`text-xs font-medium ${strengthTextColors[strength]}`}>
          {strengthTexts[strength]}
        </span>
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          {checks.length ? (
            <Check className="w-3 h-3 text-green-600" aria-hidden="true" />
          ) : (
            <X className="w-3 h-3 text-gray-400" aria-hidden="true" />
          )}
          <span className={checks.length ? 'text-green-700' : 'text-gray-600'}>
            En az 8 karakter
          </span>
        </div>
        <div className="flex items-center gap-1">
          {checks.uppercase ? (
            <Check className="w-3 h-3 text-green-600" aria-hidden="true" />
          ) : (
            <X className="w-3 h-3 text-gray-400" aria-hidden="true" />
          )}
          <span className={checks.uppercase ? 'text-green-700' : 'text-gray-600'}>
            Büyük harf (A-Z)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {checks.lowercase ? (
            <Check className="w-3 h-3 text-green-600" aria-hidden="true" />
          ) : (
            <X className="w-3 h-3 text-gray-400" aria-hidden="true" />
          )}
          <span className={checks.lowercase ? 'text-green-700' : 'text-gray-600'}>
            Küçük harf (a-z)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {checks.number ? (
            <Check className="w-3 h-3 text-green-600" aria-hidden="true" />
          ) : (
            <X className="w-3 h-3 text-gray-400" aria-hidden="true" />
          )}
          <span className={checks.number ? 'text-green-700' : 'text-gray-600'}>
            Rakam (0-9)
          </span>
        </div>
      </div>
    </div>
  );
}
