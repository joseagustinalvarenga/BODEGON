'use client';
import { useEffect, useState } from 'react';
import { promotionApi } from '@/lib/api';
import type { Promotion } from '@/lib/types';
import Link from 'next/link';

export default function PromotionsPage() {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        promotionApi.getForMember().then(setPromos).catch(console.error).finally(() => setLoading(false));
    }, []);

    const formatType = (p: Promotion) => {
        if (p.discountType === 'PERCENTAGE') return `${p.discountValue}% OFF`;
        if (p.discountType === 'FIXED') return `$${p.discountValue} OFF`;
        return `${p.discountValue}x Puntos`;
    };

    const isExpired = (p: Promotion) => new Date(p.endAt) < new Date();

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <h1 className="page-title">Promociones del Club</h1>
            <p className="page-subtitle">Ofertas exclusivas para miembros</p>

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Cargando promociones...</div>
            ) : promos.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
                    <div style={{ color: 'var(--text-secondary)' }}>No hay promociones activas.</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {promos.map((p) => (
                        <Link key={p.id} href={`/dashboard/promotions/${p.id}`} style={{ textDecoration: 'none' }}>
                            <div className="promo-card" style={{ opacity: isExpired(p) ? 0.5 : 1 }}>
                                <div
                                    className="promo-img"
                                    style={{
                                        background: 'linear-gradient(135deg, #0e1a10, #152318)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 48,
                                        height: 140,
                                    }}
                                >
                                    🔥
                                </div>
                                <div className="promo-body">
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div className="promo-title" style={{ marginBottom: 0 }}>
                                            {p.title}
                                        </div>
                                        {p.memberOnly && (
                                            <span className="badge badge-green" style={{ flexShrink: 0, marginLeft: 8 }}>
                                                VIP
                                            </span>
                                        )}
                                    </div>
                                    <div className="promo-desc">{p.description}</div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: 8,
                                        }}
                                    >
                                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-primary)' }}>
                                            {formatType(p)}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            hasta {new Date(p.endAt).toLocaleDateString('es-AR')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
