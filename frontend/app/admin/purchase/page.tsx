'use client';
import { useState } from 'react';
import { adminApi } from '../../../lib/api';
import type { MemberProfile, PurchaseResponse } from '../../../lib/types';

type Step = 'search' | 'found' | 'new-account' | 'done';

export default function PurchasePage() {
    const [step, setStep] = useState<Step>('search');
    const [dni, setDni] = useState('');
    const [amount, setAmount] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [member, setMember] = useState<MemberProfile | null>(null);
    const [result, setResult] = useState<PurchaseResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const pointsPreview = amount && Number(amount) > 0 ? Math.floor(Number(amount) * 0.01) : 0;

    const handleSearch = async () => {
        if (!dni.trim()) return;
        setLoading(true);
        setError('');
        try {
            const m = await adminApi.searchByDni(dni.trim());
            setMember(m);
            setStep('found');
        } catch (e: any) {
            if (e?.response?.status === 404) {
                setMember(null);
                setStep('new-account');
            } else {
                setError('Error al buscar el cliente');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!amount || Number(amount) <= 0) { setError('Ingresá un monto válido'); return; }
        if (step === 'new-account' && !fullName.trim()) { setError('El nombre es obligatorio'); return; }
        if (step === 'new-account' && !birthDate) { setError('La fecha de nacimiento es obligatoria'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await adminApi.registerPurchase({
                dni: dni.trim(),
                fullName: step === 'new-account' ? fullName.trim() : undefined,
                phone: step === 'new-account' && phone.trim() ? phone.trim() : undefined,
                birthDate: step === 'new-account' ? birthDate : undefined,
                amount: Number(amount),
            });
            setResult(res);
            setStep('done');
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Error al registrar la compra');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('search');
        setDni(''); setAmount(''); setFullName(''); setPhone('');
        setMember(null); setResult(null); setError('');
        setBirthDate('');
    };

    return (
        <div style={{ padding: '32px', maxWidth: 560 }}>
            <h1 className="page-title" style={{ marginBottom: 8 }}>Registrar Compra</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
                Buscá al cliente por DNI e ingresá el monto de la compra. Cada $100 = 1 punto.
            </p>

            {/* ── DONE ── */}
            {step === 'done' && result && (
                <div style={{
                    background: 'rgba(122,170,138,0.12)',
                    border: '1px solid rgba(122,170,138,0.4)',
                    borderRadius: 12, padding: 28,
                }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                        {result.newAccount ? '✦ Cuenta nueva creada' : '✦ Puntos acreditados'}
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--green-primary)', marginBottom: 8 }}>
                        +{result.pointsEarned} puntos
                    </div>
                    <div style={{ fontSize: 17, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>
                        {result.fullName}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        DNI {result.dni} · Saldo actual:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{result.currentPoints} pts</strong>
                    </div>
                    <button className="btn-primary" onClick={reset}
                        style={{ marginTop: 24, width: '100%', padding: '12px 0' }}>
                        Registrar otra compra
                    </button>
                </div>
            )}

            {/* ── SEARCH ── */}
            {step === 'search' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label className="form-label">DNI del cliente</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                className="form-input"
                                placeholder="Ej: 32456789"
                                value={dni}
                                onChange={e => setDni(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="btn-primary" onClick={handleSearch}
                                disabled={loading || !dni.trim()}
                                style={{ whiteSpace: 'nowrap', padding: '0 20px' }}>
                                {loading ? '…' : 'Buscar'}
                            </button>
                        </div>
                    </div>
                    {error && <div style={{ color: '#e07070', fontSize: 13 }}>{error}</div>}
                </div>
            )}

            {/* ── FOUND ── */}
            {step === 'found' && member && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: 20,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--green-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                                Cliente encontrado
                            </div>
                            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{member.fullName}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                                DNI {dni} · {member.level} · {member.currentPoints} pts
                            </div>
                        </div>
                        <button onClick={reset}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>
                            ✕
                        </button>
                    </div>

                    <div>
                        <label className="form-label">Monto de la compra ($)</label>
                        <input
                            className="form-input"
                            type="number" min="1"
                            placeholder="Ej: 100000"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        {pointsPreview > 0 && (
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                                = <strong style={{ color: 'var(--green-primary)', fontSize: 15 }}>{pointsPreview} puntos</strong> a sumar
                            </div>
                        )}
                    </div>

                    {error && <div style={{ color: '#e07070', fontSize: 13 }}>{error}</div>}

                    <button className="btn-primary" onClick={handleRegister}
                        disabled={loading || !amount || pointsPreview === 0}
                        style={{ width: '100%', padding: '13px 0' }}>
                        {loading ? 'Procesando…' : 'Registrar Compra'}
                    </button>
                </div>
            )}

            {/* ── NEW ACCOUNT ── */}
            {step === 'new-account' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{
                        background: 'rgba(201,168,76,0.08)',
                        border: '1px solid rgba(201,168,76,0.35)',
                        borderRadius: 10, padding: 16,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                                DNI no encontrado
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                                Se creará una cuenta nueva para DNI <strong>{dni}</strong>
                            </div>
                        </div>
                        <button onClick={reset}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>
                            ✕
                        </button>
                    </div>

                    <div>
                        <label className="form-label">DNI</label>
                        <input
                            className="form-input"
                            value={dni}
                            readOnly
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                    </div>

                    <div>
                        <label className="form-label">Nombre completo <span style={{ color: '#e07070' }}>*</span></label>
                        <input
                            className="form-input"
                            placeholder="Juan Pérez"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="form-label">Fecha de nacimiento <span style={{ color: '#e07070' }}>*</span></label>
                        <input
                            className="form-input"
                            type="date"
                            value={birthDate}
                            onChange={e => setBirthDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="form-label">Teléfono <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                        <input
                            className="form-input"
                            placeholder="Ej: 3764123456"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="form-label">Monto de la compra ($) <span style={{ color: '#e07070' }}>*</span></label>
                        <input
                            className="form-input"
                            type="number" min="1"
                            placeholder="Ej: 100000"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        {pointsPreview > 0 && (
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                                = <strong style={{ color: 'var(--green-primary)', fontSize: 15 }}>{pointsPreview} puntos</strong> a sumar
                            </div>
                        )}
                    </div>

                    {error && <div style={{ color: '#e07070', fontSize: 13 }}>{error}</div>}

                    <button className="btn-primary" onClick={handleRegister}
                        disabled={loading || !fullName.trim() || !birthDate || !amount || pointsPreview === 0}
                        style={{ width: '100%', padding: '13px 0' }}>
                        {loading ? 'Creando cuenta y registrando…' : 'Crear Cuenta y Registrar Compra'}
                    </button>
                </div>
            )}
        </div>
    );
}
