'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { AdminMember } from '@/lib/types';
import toast from 'react-hot-toast';

const levelColors = { GOLD: '#fbbf24', SILVER: '#94a3b8', BRONZE: '#b4865a' };
const levelLabels = { GOLD: 'Oro', SILVER: 'Plata', BRONZE: 'Bronce' };

export default function AdminMembersPage() {
    const [members, setMembers] = useState<AdminMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<{ member: AdminMember; points: string; description: string } | null>(null);
    const [adjusting, setAdjusting] = useState(false);

    useEffect(() => {
        adminApi.getMembers()
            .then(setMembers)
            .catch(() => toast.error('Error al cargar miembros'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = members.filter(
        (m) =>
            m.fullName.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdjust = async () => {
        if (!modal) return;
        const pts = parseInt(modal.points);
        if (isNaN(pts) || pts === 0) { toast.error('Ingresá un valor válido'); return; }
        if (!modal.description.trim()) { toast.error('Ingresá una descripción'); return; }
        setAdjusting(true);
        try {
            await adminApi.adjustPoints(modal.member.memberId, pts, modal.description);
            toast.success(`Puntos ajustados: ${pts > 0 ? '+' : ''}${pts}`);
            const updated = await adminApi.getMembers();
            setMembers(updated);
            setModal(null);
        } catch {
            toast.error('Error al ajustar puntos');
        } finally {
            setAdjusting(false);
        }
    };

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                    <h1 className="page-title">Gestión de Miembros</h1>
                    <p className="page-subtitle">Todos los miembros del programa</p>
                </div>
                <input
                    className="input-field"
                    placeholder="🔍 Buscar miembro..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 220 }}
                />
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {[
                    { label: 'Total', val: members.length, color: 'var(--text-primary)' },
                    { label: 'Oro', val: members.filter((m) => m.level === 'GOLD').length, color: '#fbbf24' },
                    { label: 'Plata', val: members.filter((m) => m.level === 'SILVER').length, color: '#94a3b8' },
                    { label: 'Bronce', val: members.filter((m) => m.level === 'BRONZE').length, color: '#b4865a' },
                ].map((s) => (
                    <div key={s.label} style={{ padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ color: s.color, fontWeight: 800, fontSize: 16 }}>{s.val}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.label}</span>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Cargando...</div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Miembro</th>
                                <th>Email</th>
                                <th>Puntos</th>
                                <th>Total Ganados</th>
                                <th>Nivel</th>
                                <th>Visitas</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                                        {search ? 'Sin resultados' : 'No hay miembros registrados'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m) => (
                                    <tr key={m.memberId}>
                                        <td style={{ fontWeight: 600 }}>{m.fullName}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                                        <td style={{ color: 'var(--green-primary)', fontWeight: 700 }}>
                                            {m.currentPoints.toLocaleString()}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                            {m.totalPointsEarned.toLocaleString()}
                                        </td>
                                        <td>
                                            <span style={{ color: levelColors[m.level], fontWeight: 600, fontSize: 12 }}>
                                                {levelLabels[m.level]}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{m.totalVisits}</td>
                                        <td>
                                            <button
                                                className="btn-ghost"
                                                style={{ padding: '4px 12px', fontSize: 11 }}
                                                onClick={() => setModal({ member: m, points: '', description: '' })}
                                            >
                                                ± Puntos
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Points modal */}
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div className="card" style={{ width: 400, padding: 28 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                            Ajustar Puntos
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                            {modal.member.fullName} — {modal.member.currentPoints.toLocaleString()} pts actuales
                        </p>
                        <div className="form-group">
                            <label className="form-label">Puntos (positivo para sumar, negativo para restar)</label>
                            <input
                                className="input-field"
                                type="number"
                                placeholder="Ej: 100 ó -50"
                                value={modal.points}
                                onChange={(e) => setModal({ ...modal, points: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Motivo</label>
                            <input
                                className="input-field"
                                placeholder="Ej: Bonificación por cumpleaños"
                                value={modal.description}
                                onChange={(e) => setModal({ ...modal, description: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button className="btn-primary" onClick={handleAdjust} disabled={adjusting} style={{ flex: 1 }}>
                                {adjusting ? 'Guardando...' : 'Confirmar'}
                            </button>
                            <button className="btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
