'use client';
import { useEffect, useState } from 'react';
import { memberApi } from '@/lib/api';
import type { PointsTransaction, PageResponse } from '@/lib/types';

const typeInfo: Record<string, { label: string; icon: string; cls: string }> = {
    EARN:   { label: 'Puntos Ganados',   icon: '↑', cls: 'badge-green' },
    REDEEM: { label: 'Puntos Canjeados', icon: '↓', cls: 'badge-red'   },
    ADJUST: { label: 'Ajuste',           icon: '≈', cls: 'badge-silver' },
};

export default function TransactionsPage() {
    const [data, setData] = useState<PageResponse<PointsTransaction> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        memberApi.getTransactions(page, 10)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <h1 className="page-title">Historial de Transacciones</h1>
            <p className="page-subtitle">Todos tus movimientos de puntos</p>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Puntos</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Cargando...</td></tr>
                        ) : !data || data.content.length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Sin transacciones aún.</td></tr>
                        ) : (
                            data.content.map((tx) => {
                                const info = typeInfo[tx.type] ?? { label: tx.type, icon: '•', cls: 'badge-silver' };
                                const isPositive = tx.points > 0;
                                return (
                                    <tr key={tx.id}>
                                        <td>
                                            <span className={`badge ${info.cls}`}>{info.icon} {info.label}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{tx.description}</td>
                                        <td style={{ color: isPositive ? 'var(--green-primary)' : '#ef4444', fontWeight: 700 }}>
                                            {isPositive ? '+' : ''}{tx.points.toLocaleString()}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                            {new Date(tx.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {data && data.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
                    <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Anterior</button>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Página {page + 1} de {data.totalPages}</span>
                    <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }} disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
                </div>
            )}
        </div>
    );
}
