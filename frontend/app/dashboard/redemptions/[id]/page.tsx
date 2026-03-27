'use client';
import { use, useEffect, useState, useRef } from 'react';
import { memberApi } from '@/lib/api';
import type { MemberRedemption } from '@/lib/types';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function RedemptionQRPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [redemption, setRedemption] = useState<MemberRedemption | null>(null);
    const [loading, setLoading] = useState(true);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        memberApi.getRedemptions()
            .then((list) => {
                const found = list.find((r) => r.id === id);
                setRedemption(found ?? null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    // Generate real QR code once we have the code string
    useEffect(() => {
        if (!redemption?.code) return;
        QRCode.toDataURL(redemption.code, {
            width: 240,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H',
        }).then(setQrDataUrl).catch(console.error);
    }, [redemption?.code]);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

    const isExpired = (iso: string) => new Date(iso) < new Date();

    if (loading) {
        return (
            <div className="page-container fade-in" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                Cargando canje...
            </div>
        );
    }

    if (!redemption) {
        return (
            <div className="page-container fade-in" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
                <p style={{ color: 'var(--text-secondary)' }}>Canje no encontrado.</p>
                <Link href="/dashboard/redemptions">
                    <button className="btn-ghost" style={{ marginTop: 16 }}>← Mis Canjes</button>
                </Link>
            </div>
        );
    }

    const expired = isExpired(redemption.expiresAt);
    const alreadyUsed = redemption.status === 'REDEEMED';
    const isValid = redemption.status === 'ISSUED' && !expired;

    return (
        <div className="page-container fade-in" style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: 440, width: '100%' }}>
                <Link href="/dashboard/redemptions">
                    <button className="btn-ghost" style={{ marginBottom: 24, padding: '8px 16px', fontSize: 13 }}>
                        ← Mis Canjes
                    </button>
                </Link>

                <div className="card-glow" style={{ textAlign: 'center', padding: '40px 32px' }}>
                    {/* Status header */}
                    {isValid ? (
                        <>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-primary)', marginBottom: 4 }}>
                                ¡Canje Listo!
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                                {redemption.rewardName}
                            </p>
                        </>
                    ) : alreadyUsed ? (
                        <>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                Ya fue utilizado
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
                                {redemption.rewardName}
                            </p>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>⏰</div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#ef4444', marginBottom: 4 }}>
                                Canje Vencido
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
                                {redemption.rewardName}
                            </p>
                        </>
                    )}

                    {/* QR Code */}
                    <div
                        style={{
                            width: 240,
                            height: 240,
                            background: '#fff',
                            borderRadius: 16,
                            margin: '0 auto 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 8,
                            filter: (!isValid) ? 'grayscale(1) opacity(0.4)' : 'none',
                            transition: 'filter 0.3s',
                        }}
                    >
                        {qrDataUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={qrDataUrl}
                                alt={`QR del canje ${redemption.code}`}
                                style={{ width: '100%', height: '100%', borderRadius: 10 }}
                            />
                        ) : (
                            <div style={{ color: '#ccc', fontSize: 13 }}>Generando QR...</div>
                        )}
                    </div>

                    {/* Code */}
                    <div
                        style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 20px',
                            marginBottom: 16,
                            fontFamily: 'monospace',
                            fontSize: 14,
                            color: 'var(--green-primary)',
                            letterSpacing: '0.1em',
                            wordBreak: 'break-all',
                        }}
                    >
                        {redemption.code}
                    </div>

                    {/* Info */}
                    <div style={{ marginBottom: 24, textAlign: 'left' }}>
                        {[
                            { label: 'Recompensa', val: redemption.rewardName },
                            { label: 'Puntos usados', val: `-${redemption.pointsSpent} pts` },
                            { label: 'Emitido el', val: formatDate(redemption.issuedAt) },
                            { label: 'Vence el', val: formatDate(redemption.expiresAt) },
                        ].map((d) => (
                            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-card)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.label}</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 12 }}>{d.val}</span>
                            </div>
                        ))}
                    </div>

                    {isValid && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                            Mostrá este QR al personal del restaurante para validar tu recompensa.
                        </p>
                    )}

                    {/* Hidden canvas for printing */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            </div>
        </div>
    );
}
