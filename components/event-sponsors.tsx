'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  tier: string;
  description?: string;
  order: number;
}

interface EventSponsorsProps {
  sponsors: Sponsor[];
}

const TIER_CONFIG = {
  PLATINUM: {
    label: 'Platin Sponsorlar',
    color: 'border-gray-300 bg-gradient-to-br from-gray-100 to-gray-50',
    logoSize: 'h-24 md:h-32',
  },
  GOLD: {
    label: 'Altın Sponsorlar',
    color: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-25',
    logoSize: 'h-20 md:h-24',
  },
  SILVER: {
    label: 'Gümüş Sponsorlar',
    color: 'border-gray-200 bg-gradient-to-br from-gray-50 to-white',
    logoSize: 'h-16 md:h-20',
  },
  BRONZE: {
    label: 'Bronz Sponsorlar',
    color: 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-25',
    logoSize: 'h-14 md:h-16',
  },
};

export default function EventSponsors({ sponsors }: EventSponsorsProps) {
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  // Group sponsors by tier
  const sponsorsByTier: Record<string, Sponsor[]> = {
    PLATINUM: [],
    GOLD: [],
    SILVER: [],
    BRONZE: [],
  };

  sponsors
    .filter(s => s)
    .forEach((sponsor) => {
      const tier = sponsor.tier?.toUpperCase() || 'SILVER';
      if (sponsorsByTier[tier]) {
        sponsorsByTier[tier].push(sponsor);
      } else {
        sponsorsByTier.SILVER.push(sponsor);
      }
    });

  // Sort sponsors by order within each tier
  Object.keys(sponsorsByTier).forEach((tier) => {
    sponsorsByTier[tier].sort((a, b) => a.order - b.order);
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Sponsorlar</h2>
        <p className="text-gray-600 mt-2">Etkinliğimizi destekleyen değerli sponsorlarımız</p>
      </div>

      {(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'] as const).map((tier) => {
        const tierSponsors = sponsorsByTier[tier];
        if (tierSponsors.length === 0) return null;

        const config = TIER_CONFIG[tier];

        return (
          <div key={tier} className="space-y-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 text-center">
              {config.label}
            </h3>

            <div
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 ${
                tier === 'PLATINUM' ? 'md:grid-cols-2' : ''
              }`}
            >
              {tierSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className={`${config.color} border-2 rounded-lg p-4 md:p-6 flex flex-col items-center justify-center transition-all hover:shadow-lg`}
                >
                  <div className={`${config.logoSize} w-full relative mb-3 flex items-center justify-center`}>
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-lg">
                        <span className="text-gray-400 text-sm text-center px-2">
                          {sponsor.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center w-full">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">
                      {sponsor.name}
                    </p>

                    {sponsor.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {sponsor.description}
                      </p>
                    )}

                    {sponsor.website_url && (
                      <a
                        href={sponsor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Web Sitesi
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
