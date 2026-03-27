'use client';
import { useEffect, useState } from 'react';
import { adminApi, promotionApi, rewardApi } from '@/lib/api';
import Link from 'next/link';

export default function AdminPage() {
    const [stats, setStats] = useState({ members: 0, promotions: 0, rewards: 0 });

    useEffect(() => {
        Promise.all([
            promotionApi.getForMember(),
            rewardApi.getAll(),
            adminApi.getStats(),
        ]).then(([promos, rewards, adminStats]) => {
            setStats({ promotions: promos.length, rewards: rewards.length, members: adminStats.totalMembers });
        }).catch(console.error);
    }, []);

    const quickActions = [
        { href: '/admin/members', label: 'Gestionar Miembros', icon: '👥', desc: 'Ver y administrar cuentas' },
        { href: '/admin/promotions/create', label: 'Nueva Promoción', icon: '➕', desc: 'Crear oferta especial' },
        { href: '/admin/levels', label: 'Configurar Niveles', icon: '🏆', desc: 'Editar umbrales y beneficios' },
        { href: '/admin/redemptions', label: 'Validar Canjes', icon: '✅', desc: 'Aprobar redemptions' },
    ];

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <h1 className="page-title">Panel de Administración</h1>
            <p className="page-subtitle">Resumen del programa de fidelidad</p>

            {/* Stats */}
            <div className="grid-stats">
                {[
                    { label: 'Miembros', val: stats.members, icon: '👥', color: 'green' },
                    { label: 'Promociones Activas', val: stats.promotions, icon: '🔥', color: '' },
                    { label: 'Recompensas', val: stats.rewards, icon: '🎁', color: '' },
                    { label: 'Sistema', val: 'Activo', icon: '🟢', color: 'green' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div style={{ fontSize: 20 }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className={`stat-value ${s.color}`} style={{ fontSize: 24 }}>
                            {s.val}
                        </div>
                    </div>
                ))}
            </div>

            {/* Level distribution visual */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h2 className="section-title" style={{ marginBottom: 20 }}>Distribución de Niveles</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    {[
                        { level: 'Bronce', pct: 65, color: '#b4865a' },
                        { level: 'Plata', pct: 25, color: '#94a3b8' },
                        { level: 'Oro', pct: 10, color: '#fbbf24' },
                    ].map((l) => (
                        <div key={l.level} style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                <span style={{ color: l.color }}>{l.level}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{l.pct}%</span>
                            </div>
                            <div className="points-bar-wrap">
                                <div style={{ height: '100%', width: `${l.pct}%`, background: l.color, borderRadius: 'var(--radius-full)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick actions */}
            <div className="section-header">
                <h2 className="section-title">Acciones Rápidas</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {quickActions.map((a) => (
                    <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
                        <div
                            className="card"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green-border)';
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)';
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{a.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
