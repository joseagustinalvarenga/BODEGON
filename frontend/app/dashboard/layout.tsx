'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--bg-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div style={{ color: 'var(--green-primary)', fontSize: 14 }}>Cargando...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar variant="member" />
            <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-dark)', minWidth: 0 }}>
                {children}
            </main>
        </div>
    );
}
