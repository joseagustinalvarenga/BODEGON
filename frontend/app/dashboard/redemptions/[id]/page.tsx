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
        <div style={{
            minHeight: 'calc(100vh - 56px)',
            background: 'var(--bg-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
        }}>
            <div style={{ maxWidth: 440, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Back Link */}
                <div style={{ textAlign: 'left' }}>
                    <Link href="/dashboard/redemptions" style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        ← Volver a mis canjes
                    </Link>
                </div>

                {/* Main ticket container */}
                <div className="card-glow" style={{
                    padding: '40px 24px 32px',
                    textAlign: 'center',
                    border: '2px solid rgba(201,168,76,0.4)',
                    boxShadow: '0 0 35px rgba(201,168,76,0.15)',
                    background: 'linear-gradient(180deg, #161210 0%, #0e0b09 100%)',
                    borderRadius: 24,
                    position: 'relative',
                }}>
                    {/* Big Banner */}
                    {isValid ? (
                        <div style={{
                            background: 'rgba(201,168,76,0.12)',
                            border: '2px solid rgba(201,168,76,0.3)',
                            borderRadius: '16px',
                            padding: '20px 16px',
                            marginBottom: 28,
                            boxShadow: '0 0 15px rgba(201,168,76,0.05)',
                        }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 900,
                                color: '#c9a84c',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                margin: '0 0 8px 0',
                                lineHeight: 1.3
                            }}>
                                📣 ¡PEDILE AL MOZO QUE LO ESCANEE!
                            </h2>
                            <p style={{
                                fontSize: '13px',
                                color: 'var(--text-primary)',
                                margin: 0,
                                opacity: 0.9,
                                lineHeight: 1.4
                            }}>
                                Mostrá este código en mesa para aplicar tu beneficio.
                            </p>
                        </div>
                    ) : alreadyUsed ? (
                        <div style={{
                            background: 'rgba(122,170,138,0.08)',
                            border: '1px solid rgba(122,170,138,0.2)',
                            borderRadius: '16px',
                            padding: '16px 12px',
                            marginBottom: 28,
                        }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 800,
                                color: 'var(--green-primary)',
                                margin: 0,
                            }}>
                                🎉 BENEFICIO CANJEADO
                            </h2>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                Este código ya fue procesado con éxito.
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '16px',
                            padding: '16px 12px',
                            marginBottom: 28,
                        }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 800,
                                color: '#ef4444',
                                margin: 0,
                            }}>
                                ⏰ CANJE VENCIDO
                            </h2>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                El límite de tiempo para usar este QR expiró.
                            </p>
                        </div>
                    )}

                    {/* Reward Name */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                            Beneficio Seleccionado
                        </div>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 800,
                            color: '#fff',
                            margin: 0,
                            lineHeight: 1.3
                        }}>
                            {redemption.rewardName}
                        </h1>
                    </div>

                    {/* QR Code Container (Larger) */}
                    <div style={{
                        width: 260,
                        height: 260,
                        background: '#fff',
                        borderRadius: 20,
                        margin: '0 auto 28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 12,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                        filter: (!isValid) ? 'grayscale(1) opacity(0.3)' : 'none',
                        transition: 'filter 0.3s',
                    }}>
                        {qrDataUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={qrDataUrl}
                                alt={`QR del canje ${redemption.code}`}
                                style={{ width: '100%', height: '100%', borderRadius: 12 }}
                            />
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Generando QR...</div>
                        )}
                    </div>

                    {/* Code display */}
                    <div
                        style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '14px 20px',
                            marginBottom: 28,
                            fontFamily: 'monospace',
                            fontSize: 16,
                            fontWeight: 700,
                            color: '#c9a84c',
                            letterSpacing: '0.12em',
                            wordBreak: 'break-all',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                        }}
                    >
                        {redemption.code}
                    </div>

                    {/* Ticket details info */}
                    <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        {[
                            { label: 'Puntos usados', val: `${redemption.pointsSpent} pts` },
                            { label: 'Emitido el', val: formatDate(redemption.issuedAt) },
                            { label: 'Vence el', val: formatDate(redemption.expiresAt) },
                        ].map((d) => (
                            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{d.label}</span>
                                <span style={{ color: '#fff', fontWeight: 600, fontSize: 12 }}>{d.val}</span>
                            </div>
                        ))}
                    </div>

                    {/* Hidden canvas for printing */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            </div>
        </div>
    );
}
