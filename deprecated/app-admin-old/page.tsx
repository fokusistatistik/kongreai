'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, Settings, Shield, Activity, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";

interface AdminStats {
  kullanicilar: { toplam: number; aktif: number; pasif: number };
  birimler: { toplam: number; aktif: number; pasif: number };
  roller: { toplam: number; aktif: number; pasif: number };
  sistem: { durum: string; sonKayitlar: number };
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const adminMenus = [
    {
      id: 1,
      baslik: "Kullanıcı Yönetimi",
      aciklama: "Kullanıcıları ekle, düzenle ve sil",
      icon: Users,
      href: "/admin/kullanicilar",
      renk: "bg-primary",
    },
    {
      id: 2,
      baslik: "Birim Yönetimi",
      aciklama: "ASM ve diğer birimleri yönet",
      icon: Building2,
      href: "/admin/birimler",
      renk: "bg-secondary",
    },
    {
      id: 3,
      baslik: "Yetki Yönetimi",
      aciklama: "Roller ve yetkileri tanımla",
      icon: Shield,
      href: "/admin/yetkiler",
      renk: "bg-warning",
    },
    {
      id: 4,
      baslik: "Sistem Ayarları",
      aciklama: "Genel sistem yapılandırması",
      icon: Settings,
      href: "/admin/ayarlar",
      renk: "bg-success",
    },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('İstatistikler yüklenemedi');
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
      toast.error('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Yönetim Paneli</h1>
        <p className="text-muted-foreground mt-1">
          Sistem yönetimi ve yapılandırma
        </p>
      </div>

      {/* Admin Menus */}
      <div className="grid gap-4 md:grid-cols-2">
        {adminMenus.map((menu) => (
          <Card key={menu.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`h-14 w-14 rounded-lg ${menu.renk} flex items-center justify-center`}>
                  <menu.icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{menu.baslik}</CardTitle>
                  <CardDescription className="mt-2">{menu.aciklama}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={menu.href}>
                <Button className="w-full">Yönet</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Kullanıcılar */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2" />
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto" />
              </div>
            ) : (
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold mt-2">{stats?.kullanicilar.toplam || 0}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {stats?.kullanicilar.aktif || 0} Aktif
                  </span>
                  {(stats?.kullanicilar.pasif || 0) > 0 && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <TrendingDown className="w-3 h-3" />
                      {stats?.kullanicilar.pasif} Pasif
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Birimler */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2" />
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto" />
              </div>
            ) : (
              <div className="text-center">
                <Building2 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm text-muted-foreground">Toplam Birim</p>
                <p className="text-3xl font-bold mt-2">{stats?.birimler.toplam || 0}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {stats?.birimler.aktif || 0} Aktif
                  </span>
                  {(stats?.birimler.pasif || 0) > 0 && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <TrendingDown className="w-3 h-3" />
                      {stats?.birimler.pasif} Pasif
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roller */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2" />
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto" />
              </div>
            ) : (
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <p className="text-sm text-muted-foreground">Toplam Rol</p>
                <p className="text-3xl font-bold mt-2">{stats?.roller.toplam || 0}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {stats?.roller.aktif || 0} Aktif
                  </span>
                  {(stats?.roller.pasif || 0) > 0 && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <TrendingDown className="w-3 h-3" />
                      {stats?.roller.pasif} Pasif
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sistem Durumu */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2" />
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto" />
              </div>
            ) : (
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-muted-foreground">Sistem Durumu</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute" />
                    <div className="w-3 h-3 bg-green-500 rounded-full relative" />
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {stats?.sistem.durum === 'aktif' ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tüm sistemler çalışıyor
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
