'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { rewardApi } from '@/lib/api';
import type { Reward, RewardTrigger } from '@/lib/types';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' },
];

const emptyForm = {
    name: '',
    description: '',
    pointsCost: '',
    stock: '',
    triggerType: 'ALWAYS' as RewardTrigger,
    triggerValue: '',
    validFrom: '',
    validTo: '',
};

function triggerLabel(r: Reward) {
    if (!r.triggerType || r.triggerType === 'ALWAYS') return '—';
    if (r.triggerType === 'BIRTHDAY') return '🎂 Día de cumpleaños';
    if (r.triggerType === 'BIRTH_MONTH') return '🗓️ Mes de cumpleaños';
    if (r.triggerType === 'BIRTH_DAY_OF_MONTH') return '📅 Día del mes de nac.';
    if (r.triggerType === 'DAY_OF_WEEK') {
        const d = DAYS_OF_WEEK.find(d => d.value === r.triggerValue);
        return `📆 ${d?.label ?? r.triggerValue}`;
    }
    return '—';
}

function formatDate(dt?: string) {
    if (!dt) return '';
    return dt.substring(0, 10); // "2025-12-01T00:00:00" → "2025-12-01"
}

export default function AdminRewardsPage() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Reward | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = () => {
        setLoading(true);
        rewardApi.getAllAdmin().then(setRewards).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (r: Reward) => {
        setEditing(r);
        setForm({
            name: r.name,
            description: r.description ?? '',
            pointsCost: String(r.pointsCost),
            stock: r.stock != null ? String(r.stock) : '',
            triggerType: r.triggerType ?? 'ALWAYS',
            triggerValue: r.triggerValue ?? '',
            validFrom: formatDate(r.validFrom as unknown as string),
            validTo: formatDate(r.validTo as unknown as string),
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: form.name,
            description: form.description || undefined,
            pointsCost: Number(form.pointsCost),
            stock: form.stock !== '' ? Number(form.stock) : undefined,
            triggerType: form.triggerType,
            triggerValue: form.triggerType === 'DAY_OF_WEEK' ? form.triggerValue : undefined,
            validFrom: form.validFrom ? form.validFrom + 'T00:00:00' : undefined,
            validTo: form.validTo ? form.validTo + 'T23:59:59' : undefined,
        };
        setSaving(true);
        try {
            if (editing) {
                await rewardApi.update(editing.id, payload);
                toast.success('Recompensa actualizada');
            } else {
                await rewardApi.create(payload);
                toast.success('Recompensa creada');
            }
            setShowModal(false);
            load();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e?.response?.data?.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (r: Reward) => {
        try {
            await rewardApi.toggle(r.id);
            toast.success(r.active ? 'Recompensa desactivada' : 'Recompensa activada');
            load();
        } catch {
            toast.error('Error al cambiar estado');
        }
    };

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Recompensas</h1>
                    <p className="page-subtitle">Gestioná el catálogo de recompensas</p>
                </div>
                <button className="btn-primary" onClick={openCreate}>+ Nueva Recompensa</button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)', padding: 32 }}>Cargando...</div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Puntos</th>
                                <th>Stock</th>
                                <th>Disponible para</th>
                                <th>Vigencia</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rewards.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                        No hay recompensas. Creá la primera.
                                    </td>
                                </tr>
                            ) : rewards.map((r) => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.description || '—'}</td>
                                    <td style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{r.pointsCost.toLocaleString()}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{r.stock != null ? r.stock : '∞'}</td>
                                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{triggerLabel(r)}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {r.validFrom || r.validTo
                                            ? <>{formatDate(r.validFrom as unknown as string) || '∞'} → {formatDate(r.validTo as unknown as string) || '∞'}</>
                                            : '—'}
                                    </td>
                                    <td>
                                        <span className={`badge ${r.active ? 'badge-green' : 'badge-silver'}`}>
                                            {r.active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => openEdit(r)}>
                                                Editar
                                            </button>
                                            <button
                                                className="btn-ghost"
                                                style={{ padding: '6px 12px', fontSize: 12, color: r.active ? '#ef4444' : 'var(--green-primary)', borderColor: r.active ? 'rgba(239,68,68,0.3)' : 'var(--green-dim)' }}
                                                onClick={() => handleToggle(r)}
                                            >
                                                {r.active ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && createPortal(
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div className="card" style={{ width: 500, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
                            {editing ? 'Editar Recompensa' : 'Nueva Recompensa'}
                        </h2>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            <div>
                                <label className="form-label">Nombre *</label>
                                <input className="form-input" required value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="form-label">Descripción</label>
                                <textarea className="form-input" rows={3} value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    style={{ resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label className="form-label">Costo en Puntos *</label>
                                    <input className="form-input" type="number" min={1} required value={form.pointsCost}
                                        onChange={e => setForm({ ...form, pointsCost: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Stock (vacío = ilimitado)</label>
                                    <input className="form-input" type="number" min={0} value={form.stock}
                                        onChange={e => setForm({ ...form, stock: e.target.value })} />
                                </div>
                            </div>

                            {/* Vigencia por fechas */}
                            <div>
                                <label className="form-label">Vigencia (opcional)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Desde</label>
                                        <input className="form-input" type="date" value={form.validFrom}
                                            onChange={e => setForm({ ...form, validFrom: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Hasta</label>
                                        <input className="form-input" type="date" value={form.validTo}
                                            onChange={e => setForm({ ...form, validTo: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                    Dejá vacío para que esté siempre disponible
                                </div>
                            </div>

                            {/* Trigger */}
                            <div>
                                <label className="form-label">Disponible para</label>
                                <select className="form-input" value={form.triggerType}
                                    onChange={e => setForm({ ...form, triggerType: e.target.value as RewardTrigger, triggerValue: '' })}>
                                    <option value="ALWAYS">Todos siempre</option>
                                    <option value="BIRTHDAY">Solo el día de cumpleaños exacto</option>
                                    <option value="BIRTH_MONTH">Durante todo el mes de cumpleaños</option>
                                    <option value="BIRTH_DAY_OF_MONTH">El día del mes de su nacimiento (ej: todos los días 10)</option>
                                    <option value="DAY_OF_WEEK">Un día de la semana fijo</option>
                                </select>
                            </div>

                            {form.triggerType === 'DAY_OF_WEEK' && (
                                <div>
                                    <label className="form-label">Día de la semana</label>
                                    <select className="form-input" value={form.triggerValue}
                                        onChange={e => setForm({ ...form, triggerValue: e.target.value })}>
                                        <option value="">— Seleccioná un día —</option>
                                        {DAYS_OF_WEEK.map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {form.triggerType === 'BIRTHDAY' && (
                                <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: 12, fontSize: 13, color: '#c9a84c' }}>
                                    Aparece solo el día exacto del cumpleaños del miembro (mismo día y mes).
                                </div>
                            )}

                            {form.triggerType === 'BIRTH_MONTH' && (
                                <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: 12, fontSize: 13, color: '#c9a84c' }}>
                                    Aparece durante todo el mes de cumpleaños del miembro. Ej: si nació en marzo, la ve todo marzo.
                                </div>
                            )}

                            {form.triggerType === 'BIRTH_DAY_OF_MONTH' && (
                                <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: 12, fontSize: 13, color: '#c9a84c' }}>
                                    Aparece para cualquier miembro cuyo día de nacimiento coincida con el día del mes de hoy. Ej: si hoy es día 10, la ven todos los nacidos un día 10.
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button className="btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Recompensa'}
                                </button>
                                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
