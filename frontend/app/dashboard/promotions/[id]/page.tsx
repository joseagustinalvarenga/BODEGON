'use client';
import { use } from 'react';
import { useEffect, useState } from 'react';
import { promotionApi } from '@/lib/api';
import type { Promotion } from '@/lib/types';
import Link from 'next/link';

export default function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [promo, setPromo] = useState<Promotion | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        promotionApi.getForMember()
            .then((promos) => {
                const found = promos.find((p) => p.id === id);
                setPromo(found ?? null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const formatType = (p: Promotion) => {
        if (p.discountType === 'PERCENTAGE') return `${p.discountValue}% de descuento`;
        if (p.discountType === 'FIXED') return `$${p.discountValue} de descuento`;
        return `${p.discountValue}x puntos`;
    };

    if (loading) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Cargando...</div>;
    if (!promo) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Promoción no encontrada.</div>;

    return (
        <div className="page-container fade-in" style={{ padding: 32, maxWidth: 800 }}>
            <Link href="/dashboard/promotions">
                <button className="btn-ghost" style={{ marginBottom: 24, padding: '8px 16px', fontSize: 13 }}>
                    ← Volver
                </button>
            </Link>

            {/* Hero */}
            <div
                style={{
                    height: 220,
                    background: 'linear-gradient(135deg, #0e1a10, #152318)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 72,
                    marginBottom: 24,
                    border: '1px solid var(--green-border)',
                }}
            >
                🔥
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
                <div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                        {promo.memberOnly && <span className="badge badge-green">Solo Miembros</span>}
                        <span className={`badge ${new Date(promo.endAt) < new Date() ? 'badge-red' : 'badge-green'}`}>
                            {new Date(promo.endAt) < new Date() ? 'Vencida' : 'Activa'}
                        </span>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                        {promo.title}
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
                        {promo.description}
                    </p>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-primary)' }}>
                        {formatType(promo)}
                    </div>
                </div>

                <div>
                    <div className="card">
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                            Detalles
                        </h3>
                        {[
                            { label: 'Inicio', val: new Date(promo.startAt).toLocaleDateString('es-AR') },
                            { label: 'Vencimiento', val: new Date(promo.endAt).toLocaleDateString('es-AR') },
                            { label: 'Tipo', val: promo.discountType === 'PERCENTAGE' ? 'Porcentaje' : promo.discountType === 'FIXED' ? 'Monto fijo' : 'Multiplicador' },
                            { label: 'Acceso', val: promo.memberOnly ? 'Solo miembros' : 'Todos' },
                        ].map((d) => (
                            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-card)' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.label}</span>
                                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{d.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
