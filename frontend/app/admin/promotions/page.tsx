'use client';
import { useEffect, useState } from 'react';
import { promotionApi } from '@/lib/api';
import type { Promotion } from '@/lib/types';
import Link from 'next/link';

export default function AdminPromotionsPage() {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        promotionApi.getForMember().then(setPromos).catch(console.error).finally(() => setLoading(false));
    }, []);

    const formatType = (p: Promotion) => {
        if (p.discountType === 'PERCENTAGE') return `${p.discountValue}%`;
        if (p.discountType === 'FIXED') return `$${p.discountValue}`;
        return `${p.discountValue}x pts`;
    };

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Gestión de Promociones</h1>
                    <p className="page-subtitle">Crear y administrar ofertas del club</p>
                </div>
                <Link href="/admin/promotions/create">
                    <button className="btn-primary">➕ Nueva Promoción</button>
                </Link>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Cargando...</div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Tipo</th>
                                <th>Descuento</th>
                                <th>Acceso</th>
                                <th>Vence</th>
                                <th>Estado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {promos.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                                        Sin promociones. <Link href="/admin/promotions/create" style={{ color: 'var(--green-primary)' }}>Crear una →</Link>
                                    </td>
                                </tr>
                            ) : (
                                promos.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {p.discountType === 'PERCENTAGE' ? 'Porcentaje' : p.discountType === 'FIXED' ? 'Monto fijo' : 'Multiplicador'}
                                        </td>
                                        <td style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{formatType(p)}</td>
                                        <td>
                                            {p.memberOnly ? (
                                                <span className="badge badge-green">Miembros</span>
                                            ) : (
                                                <span className="badge badge-silver">Público</span>
                                            )}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                            {new Date(p.endAt).toLocaleDateString('es-AR')}
                                        </td>
                                        <td>
                                            {new Date(p.endAt) > new Date() ? (
                                                <span className="badge badge-green">Activa</span>
                                            ) : (
                                                <span className="badge badge-red">Vencida</span>
                                            )}
                                        </td>
                                        <td>
                                            <Link href={`/admin/promotions/${p.id}/edit`}>
                                                <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>
                                                    Editar
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
