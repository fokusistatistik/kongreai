'use client';

import Link from 'next/link';
import { ExternalLink, GraduationCap } from 'lucide-react';

export default function SiteFooter() {
    const currentYear = 2025;

    return (
        <footer className="w-full border-t bg-gradient-to-r from-gray-50 to-white py-4 md:py-8 mt-auto">
            <div className="container mx-auto px-3 md:px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                    {/* Kongre Sistemi Tarafı */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-10 md:h-12 w-10 md:w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="h-6 md:h-7 w-6 md:w-7 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs md:text-sm font-semibold text-gray-900">
                                Bilimsel Kongre Yönetim Sistemi
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-500">
                                Congress Management System
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
                                v1.0 • &copy; {currentYear}
                            </p>
                        </div>
                    </div>

                    {/* FOKUS Tarafı */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-right">
                            <Link
                                href="https://www.fokusistatistik.com"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
                            >
                                <span className="hidden sm:inline">FOKUS İstatistik tarafından geliştirildi</span>
                                <span className="sm:hidden">FOKUS İstatistik</span>
                                <ExternalLink className="h-3 md:h-3.5 w-3 md:w-3.5" />
                            </Link>
                            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
                                by Emre Bostanoğlu
                            </p>
                        </div>
                        <img
                            src="https://static.fokusistatistik.com/resimler/favicon.png"
                            alt="FOKUS"
                            className="h-8 md:h-10 w-8 md:w-10 opacity-80"
                        />
                    </div>
                </div>

                {/* Alt Bilgi Çubuğu */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-400">
                        <span>Sistem Durumu: <span className="text-green-600 font-semibold">Aktif</span></span>
                        <span className="hidden md:inline">•</span>
                        <span>Son Güncelleme: 24 Aralık 2025</span>
                        <span className="hidden md:inline">•</span>
                        <Link href="/gizlilik-politikasi" className="hover:text-gray-600 transition-colors">
                            Gizlilik Politikası
                        </Link>
                        <span className="hidden md:inline">•</span>
                        <Link
                            href="/admin/login"
                            className="hover:text-blue-600 transition-colors font-medium"
                            title="Yönetici ve Hakem Girişi"
                        >
                            Admin Paneli
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
