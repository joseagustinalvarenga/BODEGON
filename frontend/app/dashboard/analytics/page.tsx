'use client';
import { useEffect, useState } from 'react';
import { memberApi } from '@/lib/api';
import type { PointsTransaction, PageResponse } from '@/lib/types';

export default function AnalyticsPage() {
    const [data, setData] = useState<PageResponse<PointsTransaction> | null>(null);

    useEffect(() => {
        memberApi.getTransactions(0, 50).then(setData).catch(console.error);
    }, []);

    const earned   = data?.content.filter((t) => t.type === 'EARN').reduce((acc, t) => acc + t.points, 0) ?? 0;
    const redeemed = data?.content.filter((t) => t.type === 'REDEEM').reduce((acc, t) => acc + Math.abs(t.points), 0) ?? 0;
    const total    = data?.content.length ?? 0;

    const monthlyMap: Record<string, { earned: number; redeemed: number }> = {};
    data?.content.forEach((tx) => {
        const month = new Date(tx.createdAt).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
        if (!monthlyMap[month]) monthlyMap[month] = { earned: 0, redeemed: 0 };
        if (tx.type === 'EARN') monthlyMap[month].earned += tx.points;
        if (tx.type === 'REDEEM') monthlyMap[month].redeemed += Math.abs(tx.points);
    });
    const months = Object.entries(monthlyMap).slice(-6);

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <h1 className="page-title">Actividad de Puntos</h1>
            <p className="page-subtitle">Análisis de tu comportamiento de puntos</p>

            <div className="grid-stats">
                {[
                    { label: 'Total Ganado',  val: earned.toLocaleString(),   icon: '⬆️', cls: 'green' },
                    { label: 'Total Canjeado', val: redeemed.toLocaleString(), icon: '⬇️', cls: '' },
                    { label: 'Promedio / transacción', val: total > 0 ? Math.round((earned + redeemed) / total).toLocaleString() : '0', icon: '≈', cls: '' },
                    { label: 'Total Transacciones', val: (data?.totalElements ?? 0).toLocaleString(), icon: '📋', cls: '' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div style={{ fontSize: 20 }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className={`stat-value ${s.cls}`}>{s.val}</div>
                    </div>
                ))}
            </div>

            {months.length > 0 && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <h3 className="section-title" style={{ marginBottom: 24 }}>Actividad Mensual</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180 }}>
                        {months.map(([month, vals]) => {
                            const maxVal = Math.max(...months.map(([, v]) => Math.max(v.earned, v.redeemed)), 1);
                            return (
                                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 160 }}>
                                        <div title={`Ganados: ${vals.earned}`} style={{ width: 20, height: (vals.earned / maxVal) * 150, background: 'var(--green-primary)', borderRadius: '4px 4px 0 0', opacity: 0.9 }} />
                                        <div title={`Canjeados: ${vals.redeemed}`} style={{ width: 20, height: (vals.redeemed / maxVal) * 150, background: '#ef4444', borderRadius: '4px 4px 0 0', opacity: 0.7 }} />
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{month}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}><div style={{ width: 10, height: 10, background: 'var(--green-primary)', borderRadius: 2 }} />Ganados</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}><div style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2 }} />Canjeados</div>
                    </div>
                </div>
            )}

            {data && data.content.length > 0 && (
                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 16 }}>Últimas Transacciones</h3>
                    {data.content.slice(0, 5).map((tx) => (
                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-card)' }}>
                            <div>
                                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{tx.description}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(tx.createdAt).toLocaleDateString('es-AR')}</div>
                            </div>
                            <div style={{ color: tx.points > 0 ? 'var(--green-primary)' : '#ef4444', fontWeight: 700 }}>
                                {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
