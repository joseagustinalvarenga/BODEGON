'use client';
import { useEffect, useState, lazy, Suspense } from 'react';
import { adminApi } from '@/lib/api';
import type { AdminRedemption } from '@/lib/types';
import toast from 'react-hot-toast';

// Dynamic import to avoid SSR issues with html5-qrcode
const QrScanner = lazy(() => import('@/components/QrScanner'));

export default function AdminRedemptionsPage() {
    const [pending, setPending] = useState<AdminRedemption[]>([]);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [found, setFound] = useState<AdminRedemption | null>(null);
    const [searching, setSearching] = useState(false);
    const [validating, setValidating] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const loadPending = () => {
        adminApi.getRedemptions()
            .then(setPending)
            .catch(() => toast.error('Error al cargar canjes'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadPending(); }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setSearching(true);
        try {
            const match = pending.find(
                (r) => r.code.toLowerCase() === code.trim().toLowerCase()
            );
            if (match) {
                setFound(match);
            } else {
                toast.error('Código no encontrado entre los canjes pendientes');
                setFound(null);
            }
        } finally {
            setSearching(false);
        }
    };

    const handleValidate = async (targetCode: string) => {
        setValidating(true);
        try {
            await adminApi.validateRedemption(targetCode);
            toast.success('¡Canje validado exitosamente!');
            setFound(null);
            setCode('');
            setLoading(true);
            loadPending();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error(error?.response?.data?.message || 'Error al validar el canje');
        } finally {
            setValidating(false);
        }
    };

    // Called when QR scanner detects a code
    const handleQrScan = (scannedCode: string) => {
        setShowScanner(false);
        setCode(scannedCode);
        // Auto-search
        const match = pending.find((r) => r.code.toLowerCase() === scannedCode.toLowerCase());
        if (match) {
            setFound(match);
            toast.success('QR detectado — ¡código encontrado!');
        } else {
            toast.error('Código del QR no encontrado en canjes pendientes');
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const isExpired = (iso: string) => new Date(iso) < new Date();

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <h1 className="page-title">Validar Canjes</h1>
            <p className="page-subtitle">Escaneá el QR del cliente o ingresá el código manualmente</p>

            {/* Search + Scan */}
            <div className="card" style={{ marginBottom: 24, maxWidth: 620 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                    Buscar Canje
                </h2>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input
                        className="input-field"
                        placeholder="BDG-XXXXXX"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        style={{ flex: 1, minWidth: 180, fontFamily: 'monospace' }}
                        required
                    />
                    <button className="btn-primary" type="submit" disabled={searching}>
                        {searching ? '...' : 'Buscar'}
                    </button>
                    {/* QR Scanner button */}
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowScanner(true)}
                        title="Escanear QR con la cámara"
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="3" width="7" height="7" rx="1"/>
                            <rect x="3" y="14" width="7" height="7" rx="1"/>
                            <path d="M14 14h2v2h-2zm4 0h3v3h-3zm0 4v3h-3"/>
                        </svg>
                        Escanear QR
                    </button>
                </form>
            </div>

            {/* Found result */}
            {found && (
                <div className="card-glow" style={{ maxWidth: 620, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ fontSize: 20, color: 'var(--green-primary)' }}>✅</div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-primary)' }}>Código Válido</h2>
                    </div>
                    {[
                        { label: 'Código', val: found.code },
                        { label: 'Miembro', val: found.memberName },
                        { label: 'Email', val: found.memberEmail },
                        { label: 'Recompensa', val: found.rewardName },
                        { label: 'Puntos usados', val: found.pointsSpent.toString() },
                        { label: 'Vencimiento', val: formatDate(found.expiresAt) },
                    ].map((d) => (
                        <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-card)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{d.label}</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 13, fontFamily: d.label === 'Código' ? 'monospace' : undefined }}>{d.val}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                        <button className="btn-primary" onClick={() => handleValidate(found.code)} disabled={validating} style={{ flex: 1 }}>
                            {validating ? 'Validando...' : '✓ Confirmar Entrega'}
                        </button>
                        <button className="btn-ghost" onClick={() => { setFound(null); setCode(''); }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Pending list */}
            <div>
                <h2 className="section-title" style={{ marginBottom: 16 }}>
                    Canjes Pendientes {!loading && `(${pending.length})`}
                </h2>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)' }}>Cargando...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Miembro</th>
                                    <th>Recompensa</th>
                                    <th>Puntos</th>
                                    <th>Vence</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                                            No hay canjes pendientes
                                        </td>
                                    </tr>
                                ) : (
                                    pending.map((r) => (
                                        <tr key={r.id}>
                                            <td style={{ fontFamily: 'monospace', color: 'var(--green-primary)', fontSize: 12 }}>{r.code}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{r.memberName}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.memberEmail}</div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{r.rewardName}</td>
                                            <td style={{ color: '#ef4444' }}>-{r.pointsSpent}</td>
                                            <td style={{ color: isExpired(r.expiresAt) ? '#ef4444' : 'var(--text-muted)', fontSize: 12 }}>
                                                {formatDate(r.expiresAt)}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-primary"
                                                    style={{ padding: '4px 12px', fontSize: 11 }}
                                                    onClick={() => { setCode(r.code); setFound(r); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                >
                                                    Validar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* QR Scanner modal */}
            {showScanner && (
                <Suspense fallback={null}>
                    <QrScanner
                        onScan={handleQrScan}
                        onClose={() => setShowScanner(false)}
                    />
                </Suspense>
            )}
        </div>
    );
}
