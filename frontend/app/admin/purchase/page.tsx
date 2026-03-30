'use client';
import { useState } from 'react';
import { adminApi } from '../../../lib/api';
import type { MemberProfile, PurchaseResponse } from '../../../lib/types';

export default function PurchasePage() {
    const [dni, setDni] = useState('');
    const [amount, setAmount] = useState('');
    const [fullName, setFullName] = useState('');
    const [member, setMember] = useState<MemberProfile | null | undefined>(undefined);
    const [result, setResult] = useState<PurchaseResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!dni.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);
        setMember(undefined);
        try {
            const m = await adminApi.searchByDni(dni.trim());
            setMember(m);
        } catch (e: any) {
            if (e?.response?.status === 404) {
                setMember(null);
            } else {
                setError('Error al buscar el cliente');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!amount || Number(amount) <= 0) { setError('Ingresá un monto válido'); return; }
        if (member === null && !fullName.trim()) { setError('Ingresá el nombre del cliente'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await adminApi.registerPurchase({
                dni: dni.trim(),
                fullName: member === null ? fullName.trim() : undefined,
                amount: Number(amount),
            });
            setResult(res);
            setMember(undefined);
            setDni(''); setAmount(''); setFullName('');
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Error al registrar la compra');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setMember(undefined); setResult(null);
        setDni(''); setAmount(''); setFullName(''); setError('');
    };

    const pointsPreview = amount && Number(amount) > 0 ? Math.floor(Number(amount) * 0.01) : 0;

    return (
        <div style={{ padding: '32px', maxWidth: 560 }}>
            <h1 className="page-title" style={{ marginBottom: 8 }}>Registrar Compra</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
                Buscá al cliente por DNI, ingresá el monto y sumale los puntos correspondientes.
                Cada $100 equivale a 1 punto.
            </p>

            {result && (
                <div style={{
                    background: 'rgba(122,170,138,0.12)', border: '1px solid rgba(122,170,138,0.4)',
                    borderRadius: 10, padding: 24, marginBottom: 24
                }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {result.newAccount ? 'Cuenta nueva creada' : 'Puntos acreditados'}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green-primary)', marginBottom: 6 }}>
                        +{result.pointsEarned} puntos
                    </div>
                    <div style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 2 }}>{result.fullName}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        DNI {result.dni} · Saldo actual:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{result.currentPoints} pts</strong>
                    </div>
                    <button className="btn-primary" onClick={reset} style={{ marginTop: 20, width: '100%' }}>
                        Registrar otra compra
                    </button>
                </div>
            )}

            {!result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* DNI search */}
                    <div>
                        <label className="form-label">DNI del cliente</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                className="form-input"
                                placeholder="Ej: 32456789"
                                value={dni}
                                onChange={e => { setDni(e.target.value); setMember(undefined); }}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                style={{ flex: 1 }}
                            />
                            <button
                                className="btn-primary"
                                onClick={handleSearch}
                                disabled={loading || !dni.trim()}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                {loading ? '…' : 'Buscar'}
                            </button>
                        </div>
                    </div>

                    {/* Found */}
                    {member !== undefined && member !== null && (
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 8, padding: 16
                        }}>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cliente encontrado</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{member.fullName}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                {member.level} · {member.currentPoints} puntos actuales
                            </div>
                        </div>
                    )}

                    {/* Not found → create */}
                    {member === null && (
                        <div style={{
                            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)',
                            borderRadius: 8, padding: 16
                        }}>
                            <div style={{ fontSize: 13, color: '#c9a84c', marginBottom: 12 }}>
                                Cliente no encontrado — se creará una cuenta nueva
                            </div>
                            <label className="form-label">Nombre completo</label>
                            <input
                                className="form-input"
                                placeholder="Juan Pérez"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Amount */}
                    {member !== undefined && (
                        <div>
                            <label className="form-label">Monto de la compra ($)</label>
                            <input
                                className="form-input"
                                type="number"
                                min="1"
                                placeholder="Ej: 100000"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                            {pointsPreview > 0 && (
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                                    = <strong style={{ color: 'var(--green-primary)' }}>{pointsPreview} puntos</strong> a sumar
                                </div>
                            )}
                        </div>
                    )}

                    {error && <div style={{ color: '#e07070', fontSize: 13 }}>{error}</div>}

                    {member !== undefined && (
                        <button
                            className="btn-primary"
                            onClick={handleRegister}
                            disabled={loading || !amount || pointsPreview === 0}
                            style={{ width: '100%', padding: '12px 0' }}
                        >
                            {loading ? 'Procesando…' : 'Registrar Compra'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
