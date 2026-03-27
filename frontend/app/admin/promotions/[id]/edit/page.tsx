'use client';
import { useEffect, useState } from 'react';
import { promotionApi } from '@/lib/api';
import type { Promotion } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditPromotionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [form, setForm] = useState({
        title: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        startDate: '',
        endDate: '',
        memberOnly: false,
    });

    // Load existing promotion data
    useEffect(() => {
        promotionApi.getForMember()
            .then((promos: Promotion[]) => {
                const promo = promos.find((p) => p.id === id);
                if (promo) {
                    setForm({
                        title: promo.title ?? '',
                        description: promo.description ?? '',
                        discountType: promo.discountType ?? 'PERCENTAGE',
                        discountValue: String(promo.discountValue ?? ''),
                        startDate: promo.startAt ? promo.startAt.slice(0, 10) : '',
                        endDate: promo.endAt ? promo.endAt.slice(0, 10) : '',
                        memberOnly: promo.memberOnly ?? false,
                    });
                } else {
                    toast.error('Promoción no encontrada');
                    router.push('/admin/promotions');
                }
            })
            .catch(() => toast.error('Error al cargar la promoción'))
            .finally(() => setFetching(false));
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await promotionApi.update(id, {
                title: form.title,
                description: form.description,
                type: form.memberOnly ? 'MEMBERS_ONLY' : 'PUBLIC',
                startAt: form.startDate ? `${form.startDate}T00:00:00` : '',
                endAt: form.endDate ? `${form.endDate}T23:59:59` : '',
                discountType: form.discountType as 'PERCENTAGE' | 'FIXED' | 'POINTS_MULTIPLIER',
                discountValue: parseFloat(form.discountValue),
            } as Partial<Promotion>);
            toast.success('¡Promoción actualizada!');
            router.push('/admin/promotions');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || 'Error al actualizar la promoción');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div style={{ padding: 32, color: 'var(--text-muted)' }}>Cargando promoción...</div>
        );
    }

    return (
        <div className="page-container fade-in" style={{ padding: 32, maxWidth: 700 }}>
            <Link href="/admin/promotions">
                <button className="btn-ghost" style={{ marginBottom: 24, padding: '8px 16px', fontSize: 13 }}>
                    ← Volver a Promociones
                </button>
            </Link>

            <h1 className="page-title">Editar Promoción</h1>
            <p className="page-subtitle">Modificá los datos de la promoción existente</p>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Título *</label>
                        <input
                            className="input-field"
                            placeholder="Ej: 2x Puntos en Combos"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción *</label>
                        <textarea
                            className="input-field"
                            rows={3}
                            placeholder="Describí los detalles de la promoción..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Tipo de Descuento *</label>
                            <select
                                className="input-field"
                                value={form.discountType}
                                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="PERCENTAGE">Porcentaje (%)</option>
                                <option value="FIXED">Monto Fijo ($)</option>
                                <option value="POINTS_MULTIPLIER">Multiplicador de Puntos</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">
                                Valor *{' '}
                                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                                    ({form.discountType === 'PERCENTAGE' ? '%' : form.discountType === 'FIXED' ? '$' : 'multiplicador'})
                                </span>
                            </label>
                            <input
                                className="input-field"
                                type="number"
                                min={0}
                                step={form.discountType === 'PERCENTAGE' ? 1 : 0.01}
                                placeholder="Ej: 20"
                                value={form.discountValue}
                                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Fecha de Inicio *</label>
                            <input
                                className="input-field"
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                required
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Fecha de Fin *</label>
                            <input
                                className="input-field"
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                required
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginTop: 20,
                            padding: '14px 16px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <input
                            type="checkbox"
                            id="memberOnly"
                            checked={form.memberOnly}
                            onChange={(e) => setForm({ ...form, memberOnly: e.target.checked })}
                            style={{ width: 16, height: 16, accentColor: 'var(--green-primary)', cursor: 'pointer' }}
                        />
                        <label htmlFor="memberOnly" style={{ cursor: 'pointer' }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                                Solo para miembros del club
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                Si está habilitado, solo los miembros registrados verán esta promoción
                            </div>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Guardando...' : '✓ Guardar Cambios'}
                        </button>
                        <Link href="/admin/promotions">
                            <button className="btn-ghost" type="button">
                                Cancelar
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
