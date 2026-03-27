'use client';
import { useEffect, useState } from 'react';
import { memberApi } from '@/lib/api';
import type { MemberProfile } from '@/lib/types';
import Link from 'next/link';

const LEVEL_DATA = {
    GOLD:   { label: 'Oro',    icon: '🥇', color: '#fbbf24', nextLabel: null,   nextPts: null, minPts: 5000 },
    SILVER: { label: 'Plata',  icon: '🥈', color: '#94a3b8', nextLabel: 'Oro',  nextPts: 5000, minPts: 1000 },
    BRONZE: { label: 'Bronce', icon: '🥉', color: '#b4865a', nextLabel: 'Plata', nextPts: 1000, minPts: 0 },
};

export default function DashboardPage() {
    const [profile, setProfile] = useState<MemberProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        memberApi.getProfile().then(setProfile).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page-container fade-in" style={{ padding: 32, color: 'var(--text-muted)' }}>Cargando tu perfil...</div>;

    const levelInfo = LEVEL_DATA[profile?.level ?? 'BRONZE'];
    const earned = profile?.totalPointsEarned ?? 0;
    const progress = levelInfo.nextPts
        ? Math.min(((earned - levelInfo.minPts) / (levelInfo.nextPts - levelInfo.minPts)) * 100, 100)
        : 100;
    const ptsToNext = levelInfo.nextPts ? Math.max(levelInfo.nextPts - earned, 0) : 0;
    const firstName = profile?.fullName?.split(' ')[0] ?? 'Usuario';

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 className="page-title">Hola, {firstName} 👋</h1>
                <p className="page-subtitle">Mirá tu progreso y actividad reciente</p>
            </div>

            {/* Main points card */}
            <div className="card-glow pulse-glow" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #0e1a10 0%, #0a140c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                        Tus Puntos Actuales
                    </div>
                    <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--green-primary)', lineHeight: 1 }}>
                        {(profile?.currentPoints ?? 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>puntos disponibles</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: `${levelInfo.color}20`, border: `1px solid ${levelInfo.color}40`, borderRadius: 'var(--radius-full)', marginBottom: 12 }}>
                        <span style={{ fontSize: 20 }}>{levelInfo.icon}</span>
                        <span style={{ color: levelInfo.color, fontWeight: 700, fontSize: 14 }}>Nivel {levelInfo.label}</span>
                    </div>
                    {levelInfo.nextPts && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {ptsToNext.toLocaleString()} pts para nivel {levelInfo.nextLabel}
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {levelInfo.nextPts && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Progreso hacia nivel {levelInfo.nextLabel}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{earned.toLocaleString()} / {levelInfo.nextPts.toLocaleString()} pts totales</span>
                    </div>
                    <div className="points-bar-wrap">
                        <div className="points-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: levelInfo.color }}>{levelInfo.label}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{levelInfo.nextLabel}</span>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid-stats">
                {[
                    { label: 'Puntos Disponibles', val: (profile?.currentPoints ?? 0).toLocaleString(), icon: '⭐', color: 'green', link: '/dashboard/analytics' },
                    { label: 'Nivel Actual', val: levelInfo.label, icon: levelInfo.icon, color: '', link: null },
                    { label: 'Total Visitas', val: (profile?.totalVisits ?? 0).toString(), icon: '📅', color: '', link: null },
                    { label: 'Recompensas', val: 'Ver →', icon: '🎁', color: 'green', link: '/dashboard/rewards' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div style={{ fontSize: 20 }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        {s.link ? (
                            <Link href={s.link}><div className={`stat-value ${s.color}`} style={{ fontSize: 18, cursor: 'pointer' }}>{s.val}</div></Link>
                        ) : (
                            <div className={`stat-value ${s.color}`} style={{ fontSize: s.color ? 28 : 20, color: s.color ? undefined : levelInfo.color }}>{s.val}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="section-header"><h2 className="section-title">Acciones Rápidas</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                    { href: '/dashboard/rewards', label: 'Ver Recompensas', icon: '🎁', desc: 'Canjea tus puntos' },
                    { href: '/dashboard/promotions', label: 'Promociones', icon: '🔥', desc: 'Ofertas exclusivas' },
                    { href: '/dashboard/transactions', label: 'Historial', icon: '📋', desc: 'Ver movimientos' },
                    { href: '/dashboard/profile', label: 'Mi Perfil', icon: '👤', desc: 'Editar datos' },
                ].map((action) => (
                    <Link key={action.href} href={action.href}>
                        <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green-border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{action.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{action.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{action.desc}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
