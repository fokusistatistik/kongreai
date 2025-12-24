'use client';

import {
    ClipboardList,
    Calendar as CalendarIcon,
    Activity,
    LineChart,
    Plus,
    Clock,
    CheckCircle2,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock Data
const tasks = [
    { id: 1, title: 'Yıllık Faaliyet Raporu Hazırlığı', assignedTo: 'Ahmet Yılmaz', status: 'In Progress', deadline: '2025-01-15', priority: 'High' },
    { id: 2, title: 'İlçe Sağlık Denetimi', assignedTo: 'Ayşe Demir', status: 'Pending', deadline: '2025-01-20', priority: 'Medium' },
    { id: 3, title: 'Aşı Stok Kontrolü', assignedTo: 'Mehmet Öz', status: 'Completed', deadline: '2024-12-30', priority: 'Low' },
];

export default function GorevYonetimPage() {


    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Görev Yönetim Modülü</h1>
                    <p className="text-gray-500 mt-1">
                        Birim içi görev dağılımı, takip ve raporlama işlemleri
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Yeni Görev Oluştur
                </Button>
            </div>

            <Tabs defaultValue="gorevler" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-[800px]">
                    <TabsTrigger value="gorevler" className="flex gap-2">
                        <ClipboardList className="h-4 w-4" /> Görevler
                    </TabsTrigger>
                    <TabsTrigger value="takvim" className="flex gap-2">
                        <CalendarIcon className="h-4 w-4" /> Takvim
                    </TabsTrigger>
                    <TabsTrigger value="surec" className="flex gap-2">
                        <LineChart className="h-4 w-4" /> Süreç İzleme
                    </TabsTrigger>
                    <TabsTrigger value="aktivite" className="flex gap-2">
                        <Activity className="h-4 w-4" /> Günlük Aktivite
                    </TabsTrigger>
                    <TabsTrigger value="planlama" className="flex gap-2">
                        <Users className="h-4 w-4" /> Planlama
                    </TabsTrigger>
                </TabsList>

                {/* Görevler Tab */}
                <TabsContent value="gorevler" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
                                <ClipboardList className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">24</div>
                                <p className="text-xs text-muted-foreground">+2 bu hafta</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
                                <Clock className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground">4 geciken</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">128</div>
                                <p className="text-xs text-muted-foreground">Bu ay</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Aktif Görev Listesi</CardTitle>
                            <CardDescription>Birim personeline atanan son görevler</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Görev Adı</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Atanan Kişi</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Son Tarih</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Öncelik</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {tasks.map((task) => (
                                            <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">{task.title}</td>
                                                <td className="p-4 align-middle">{task.assignedTo}</td>
                                                <td className="p-4 align-middle">{task.deadline}</td>
                                                <td className="p-4 align-middle">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-green-100 text-green-700'}`}>
                                                        {task.priority === 'High' ? 'Yüksek' : task.priority === 'Medium' ? 'Orta' : 'Düşük'}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                        {task.status === 'In Progress' ? 'Devam Ediyor' : task.status === 'Completed' ? 'Tamamlandı' : 'Beklemede'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Takvim Tab */}
                <TabsContent value="takvim" className="mt-6">
                    <Card className="h-[500px] flex items-center justify-center bg-gray-50 border-dashed">
                        <div className="text-center">
                            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Takvim Modülü</h3>
                            <p className="text-gray-500">Geliştirme aşamasında...</p>
                            <p className="text-xs text-gray-400 mt-2">v2.1 sürümünde aktif edilecektir.</p>
                        </div>
                    </Card>
                </TabsContent>

                {/* Diğer Tablar (Placeholder) */}
                <TabsContent value="surec" className="mt-6">
                    <Card className="h-[400px] flex items-center justify-center bg-gray-50 border-dashed">
                        <div className="text-center">
                            <LineChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Süreç İzleme</h3>
                            <p className="text-gray-500">İş akış diyagramları ve süreç performans metrikleri burada yer alacak.</p>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="aktivite" className="mt-6">
                    <Card className="h-[400px] flex items-center justify-center bg-gray-50 border-dashed">
                        <div className="text-center">
                            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Günlük Aktivite</h3>
                            <p className="text-gray-500">Personel günlük iş listeleri ve completed/todo takibi.</p>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="planlama" className="mt-6">
                    <Card className="h-[400px] flex items-center justify-center bg-gray-50 border-dashed">
                        <div className="text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Planlama</h3>
                            <p className="text-gray-500">Kaynak planlaması ve nöbet çizelgeleri.</p>
                        </div>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
