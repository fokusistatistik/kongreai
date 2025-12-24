'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function MudurlukLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login');
            return;
        }

        // Check if user has MUDURLUK unit type
        // Note: Adjust the check based on your actual data structure in session
        const birimTip = (session.user as any)?.birim?.tip;

        // For demo purposes, if ADMIN allow access, or if actually MUDURLUK
        // Remove ADMIN check in production if strictly limited
        if (birimTip === 'MUDURLUK' || session.user?.rol?.kod === 'ADMIN') {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <div className="p-8 text-center">Yükleniyor...</div>;
    }

    if (!isAuthorized) {
        return (
            <div className="container mx-auto p-8">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <AlertCircle className="text-red-600 h-6 w-6" />
                        <CardTitle className="text-red-800">Yetkisiz Erişim</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-700">
                            Bu modüle erişim yetkiniz bulunmamaktadır. Bu alan sadece İl Sağlık Müdürlüğü birimleri (&quot;MUDURLUK&quot;) içindir.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            {children}
        </div>
    );
}
