'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (!loading && user && !isAdmin()) {
            router.push('/dashboard');
        }
    }, [user, loading, isAdmin, router]);

    if (loading || !user) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--green-primary)', fontSize: 14 }}>Cargando...</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar variant="admin" />
            <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-dark)', minWidth: 0 }}>
                {children}
            </main>
        </div>
    );
}
