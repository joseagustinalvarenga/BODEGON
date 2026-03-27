'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { rewardApi } from '@/lib/api';
import type { Reward } from '@/lib/types';
import toast from 'react-hot-toast';

const emptyForm = {
    name: '',
    description: '',
    pointsCost: '',
    stock: '',
};

export default function AdminRewardsPage() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Reward | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = () => {
        setLoading(true);
        rewardApi
            .getAllAdmin()
            .then(setRewards)
            .catch(console.error)
            .finally(() => setLoading(false));
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
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rewards.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                        No hay recompensas. Creá la primera.
                                    </td>
                                </tr>
                            ) : rewards.map((r) => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.description || '—'}</td>
                                    <td style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{r.pointsCost.toLocaleString()}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{r.stock != null ? r.stock : '∞'}</td>
                                    <td>
                                        <span className={`badge ${r.active ? 'badge-green' : 'badge-silver'}`}>
                                            {r.active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                className="btn-ghost"
                                                style={{ padding: '6px 12px', fontSize: 12 }}
                                                onClick={() => openEdit(r)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn-ghost"
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: 12,
                                                    color: r.active ? '#ef4444' : 'var(--green-primary)',
                                                    borderColor: r.active ? 'rgba(239,68,68,0.3)' : 'var(--green-dim)',
                                                }}
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
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div className="card" style={{ width: 480, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
                            {editing ? 'Editar Recompensa' : 'Nueva Recompensa'}
                        </h2>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label className="form-label">Nombre *</label>
                                <input
                                    className="input-field"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea
                                    className="input-field"
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Costo en Puntos *</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    min={1}
                                    required
                                    value={form.pointsCost}
                                    onChange={(e) => setForm({ ...form, pointsCost: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock (dejá vacío para ilimitado)</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    min={0}
                                    value={form.stock}
                                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button className="btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Recompensa'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    style={{ flex: 1 }}
                                    onClick={() => setShowModal(false)}
                                >
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
