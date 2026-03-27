'use client';
import { useEffect, useState } from 'react';
import { memberApi } from '@/lib/api';
import type { MemberRedemption } from '@/lib/types';
import Link from 'next/link';

const statusInfo: Record<string, { label: string; cls: string }> = {
    ISSUED:    { label: 'Pendiente',  cls: 'badge-gold'   },
    REDEEMED:  { label: 'Validado',   cls: 'badge-green'  },
    EXPIRED:   { label: 'Vencido',    cls: 'badge-red'    },
    CANCELLED: { label: 'Cancelado',  cls: 'badge-silver' },
};

export default function RedemptionsPage() {
    const [redemptions, setRedemptions] = useState<MemberRedemption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        memberApi.getRedemptions()
            .then(setRedemptions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

    const isExpired = (iso: string) => new Date(iso) < new Date();

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <h1 className="page-title">Mis Canjes</h1>
            <p className="page-subtitle">Historial de recompensas canjeadas</p>

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Cargando...</div>
            ) : redemptions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 16 }}>Todavía no canjeaste ninguna recompensa.</div>
                    <Link href="/dashboard/rewards">
                        <button className="btn-primary">Ver Recompensas →</button>
                    </Link>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Recompensa</th>
                                <th>Puntos</th>
                                <th>Estado</th>
                                <th>Canjeado</th>
                                <th>Vence</th>
                                <th>QR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {redemptions.map((r) => (
                                <tr key={r.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--green-primary)' }}>{r.code}</td>
                                    <td style={{ fontWeight: 500 }}>{r.rewardName}</td>
                                    <td style={{ color: '#ef4444', fontWeight: 700 }}>-{r.pointsSpent}</td>
                                    <td>
                                        <span className={`badge ${statusInfo[r.status]?.cls ?? 'badge-silver'}`}>
                                            {statusInfo[r.status]?.label ?? r.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(r.issuedAt)}</td>
                                    <td style={{ color: r.status === 'ISSUED' && isExpired(r.expiresAt) ? '#ef4444' : 'var(--text-muted)', fontSize: 12 }}>
                                        {formatDate(r.expiresAt)}
                                    </td>
                                    <td>
                                        {r.status === 'ISSUED' && !isExpired(r.expiresAt) && (
                                            <Link href={`/dashboard/redemptions/${r.id}`} style={{ color: 'var(--green-primary)', fontSize: 13, fontWeight: 600 }}>
                                                Ver QR →
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
