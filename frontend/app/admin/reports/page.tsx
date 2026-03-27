'use client';
import { useEffect, useState } from 'react';
import { adminApi, promotionApi } from '@/lib/api';
import type { AdminStats } from '@/lib/types';

export default function AdminReportsPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activePromos, setActivePromos] = useState(0);

    useEffect(() => {
        Promise.all([adminApi.getStats(), promotionApi.getForMember()])
            .then(([s, promos]) => { setStats(s); setActivePromos(promos.length); })
            .catch(console.error);
    }, []);

    const total = stats ? stats.totalMembers : 0;
    const bronze = stats?.bronze ?? 0;
    const silver = stats?.silver ?? 0;
    const gold = stats?.gold ?? 0;
    const bronzePct = total > 0 ? Math.round((bronze / total) * 100) : 0;
    const silverPct = total > 0 ? Math.round((silver / total) * 100) : 0;
    const goldPct = total > 0 ? Math.round((gold / total) * 100) : 0;
    const pointsIssued = stats?.totalPointsIssued ?? 0;
    const pointsCirculation = stats?.totalPointsInCirculation ?? 0;
    const redemptionRate = pointsIssued > 0 ? Math.round(((pointsIssued - pointsCirculation) / pointsIssued) * 100) : 0;

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <h1 className="page-title">Reportes de Performance</h1>
            <p className="page-subtitle">Análisis detallado del programa de fidelidad</p>

            {/* KPI stats */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Miembros', val: total.toLocaleString(), sub: `${gold} oro · ${silver} plata · ${bronze} bronce`, icon: '👥' },
                    { label: 'Puntos Emitidos', val: pointsIssued.toLocaleString(), sub: `${pointsCirculation.toLocaleString()} en circulación`, icon: '⭐' },
                    { label: 'Promociones Activas', val: activePromos.toString(), sub: 'en este momento', icon: '🔥' },
                    { label: 'Tasa de Canje', val: `${redemptionRate}%`, sub: 'puntos canjeados vs emitidos', icon: '📈' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div style={{ fontSize: 20 }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value green" style={{ fontSize: 22 }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Level breakdown */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 className="section-title" style={{ marginBottom: 16 }}>Distribución de Niveles</h3>
                {[
                    { level: 'Bronce', pct: bronzePct, count: bronze, color: '#b4865a' },
                    { level: 'Plata', pct: silverPct, count: silver, color: '#94a3b8' },
                    { level: 'Oro', pct: goldPct, count: gold, color: '#fbbf24' },
                ].map((l) => (
                    <div key={l.level} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ color: l.color, fontSize: 13, fontWeight: 500 }}>{l.level}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{l.count} miembros ({l.pct}%)</span>
                        </div>
                        <div className="points-bar-wrap">
                            <div style={{ height: '100%', width: `${l.pct}%`, background: l.color, borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Points summary */}
            <div className="card">
                <h3 className="section-title" style={{ marginBottom: 16 }}>Resumen de Puntos</h3>
                {[
                    { label: 'Puntos totales emitidos', val: pointsIssued.toLocaleString(), color: 'var(--green-primary)' },
                    { label: 'Puntos en circulación', val: pointsCirculation.toLocaleString(), color: 'var(--text-primary)' },
                    { label: 'Puntos canjeados / expirados', val: (pointsIssued - pointsCirculation).toLocaleString(), color: '#ef4444' },
                ].map((row) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-card)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{row.label}</span>
                        <span style={{ color: row.color, fontWeight: 700, fontSize: 14 }}>{row.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
