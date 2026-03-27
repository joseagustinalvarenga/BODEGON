'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

const memberNav = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/rewards', label: 'Recompensas', icon: '🎁' },
    { href: '/dashboard/promotions', label: 'Promociones', icon: '🔥' },
    { href: '/dashboard/transactions', label: 'Transacciones', icon: '📋' },
    { href: '/dashboard/analytics', label: 'Mi Actividad', icon: '📊' },
    { href: '/dashboard/redemptions', label: 'Mis Canjes', icon: '🎫' },
    { href: '/dashboard/profile', label: 'Perfil', icon: '👤' },
    { href: '/dashboard/account', label: 'Cuenta', icon: '🔒' },
];

const adminNav = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/members', label: 'Miembros', icon: '👥' },
    { href: '/admin/rewards', label: 'Recompensas', icon: '🎁' },
    { href: '/admin/promotions', label: 'Promociones', icon: '🔥' },
    { href: '/admin/levels', label: 'Niveles', icon: '🏆' },
    { href: '/admin/redemptions', label: 'Validar Canjes', icon: '✅' },
    { href: '/admin/reports', label: 'Reportes', icon: '📈' },
];

interface SidebarProps {
    variant: 'member' | 'admin';
}

export default function Sidebar({ variant }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAdmin } = useAuth();
    const navItems = variant === 'admin' ? adminNav : memberNav;
    const isAdminPanel = variant === 'admin';

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Close drawer on route change
    useEffect(() => {
        setDrawerOpen(false);
    }, [pathname]);

    const accent       = isAdminPanel ? '#c9a84c' : '#7aaa8a';
    const accentDim    = isAdminPanel ? 'rgba(201,168,76,0.12)' : 'rgba(122,170,138,0.12)';
    const accentBorder = isAdminPanel ? 'rgba(201,168,76,0.30)' : 'rgba(122,170,138,0.28)';
    const sidebarBg    = isAdminPanel ? '#120f08' : 'var(--bg-sidebar)';

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border-card)' }}>
                <Link href="/" onClick={() => setDrawerOpen(false)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/image.png"
                        alt="el Bodegón"
                        style={{ width: 180, height: 'auto', display: 'block', borderRadius: 8 }}
                    />
                </Link>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    marginTop: 10,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: accentDim,
                    border: `1px solid ${accentBorder}`,
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {isAdminPanel ? 'Panel Admin' : 'Club de Miembros'}
                    </span>
                </div>
            </div>

            {/* User info */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user?.email?.split('@')[0] || 'Usuario'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {user?.email}
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
                {navItems.map((item) => {
                    const isActive =
                        item.href === (isAdminPanel ? '/admin' : '/dashboard')
                            ? pathname === item.href
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 2,
                                background: isActive ? accentDim : 'transparent',
                                color: isActive ? accent : 'var(--text-secondary)',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: 13,
                                transition: 'all 0.15s',
                                borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
                            }}
                        >
                            <span style={{ fontSize: 16 }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-card)' }}>
                {variant === 'member' && isAdmin() && (
                    <Link
                        href="/admin"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            color: '#c9a84c',
                            fontSize: 12,
                            marginBottom: 4,
                        }}
                    >
                        ⚙️ Panel Admin
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                >
                    🚪 Cerrar Sesión
                </button>
            </div>
        </>
    );

    /* ── MOBILE ─────────────────────────────────────────── */
    if (isMobile) {
        return (
            <>
                {/* Top mobile header bar */}
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 56,
                        background: sidebarBg,
                        borderBottom: `1px solid ${accentBorder}`,
                        borderTop: `3px solid ${accent}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px',
                        zIndex: 200,
                    }}
                >
                    <Link href="/">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/image.png" alt="el Bodegón" style={{ height: 36, width: 'auto', borderRadius: 6 }} />
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                            {isAdminPanel ? 'Admin' : 'Mi Club'}
                        </span>
                        <button
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Abrir menú"
                            style={{
                                background: accentDim,
                                border: `1px solid ${accentBorder}`,
                                borderRadius: 8,
                                width: 36,
                                height: 36,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                                cursor: 'pointer',
                            }}
                        >
                            <span style={{ width: 18, height: 2, background: accent, borderRadius: 2, display: 'block' }} />
                            <span style={{ width: 18, height: 2, background: accent, borderRadius: 2, display: 'block' }} />
                            <span style={{ width: 18, height: 2, background: accent, borderRadius: 2, display: 'block' }} />
                        </button>
                    </div>
                </div>

                {/* Overlay */}
                {drawerOpen && (
                    <div
                        onClick={() => setDrawerOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            zIndex: 299,
                        }}
                    />
                )}

                {/* Drawer */}
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: 280,
                        height: '100vh',
                        background: sidebarBg,
                        borderRight: `1px solid ${accentBorder}`,
                        borderTop: `3px solid ${accent}`,
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 300,
                        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
                        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
                        overflowY: 'auto',
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setDrawerOpen(false)}
                        style={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: 22,
                            cursor: 'pointer',
                            lineHeight: 1,
                        }}
                        aria-label="Cerrar menú"
                    >
                        ✕
                    </button>
                    <SidebarContent />
                </div>

                {/* Spacer so content doesn't hide behind fixed top bar */}
                <div style={{ height: 56, flexShrink: 0 }} />
            </>
        );
    }

    /* ── DESKTOP ─────────────────────────────────────────── */
    return (
        <aside
            style={{
                width: 240,
                minHeight: '100vh',
                background: sidebarBg,
                borderRight: `1px solid ${accentBorder}`,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                borderTop: `3px solid ${accent}`,
            }}
        >
            <SidebarContent />
        </aside>
    );
}
