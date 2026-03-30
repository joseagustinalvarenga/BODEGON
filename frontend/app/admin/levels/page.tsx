'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { levelApi } from '@/lib/api';
import type { LevelConfig } from '@/lib/types';
import toast from 'react-hot-toast';

const LEVEL_META: Record<string, { label: string; icon: string; color: string }> = {
    BRONZE: { label: 'Bronce', icon: '🥉', color: '#b4865a' },
    SILVER: { label: 'Plata',  icon: '🥈', color: '#94a3b8' },
    GOLD:   { label: 'Oro',    icon: '🥇', color: '#fbbf24' },
};

export default function AdminLevelsPage() {
    const [configs, setConfigs]     = useState<LevelConfig[]>([]);
    const [loading, setLoading]     = useState(true);
    const [editing, setEditing]     = useState<LevelConfig | null>(null);
    const [threshold, setThreshold] = useState('');
    const [perks, setPerks]         = useState<string[]>([]);
    const [newPerk, setNewPerk]     = useState('');
    const [saving, setSaving]       = useState(false);

    const load = () => {
        setLoading(true);
        levelApi.getAll().then(setConfigs).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openEdit = (cfg: LevelConfig) => {
        setEditing(cfg);
        setThreshold(String(cfg.threshold));
        setPerks([...cfg.perks]);
        setNewPerk('');
    };

    const removePerk = (i: number) => setPerks(perks.filter((_, idx) => idx !== i));

    const addPerk = () => {
        const trimmed = newPerk.trim();
        if (!trimmed) return;
        setPerks([...perks, trimmed]);
        setNewPerk('');
    };

    const handleSave = async () => {
        if (!editing) return;
        if (editing.level !== 'BRONZE' && Number(threshold) <= 0) {
            toast.error('El umbral debe ser mayor a 0');
            return;
        }
        setSaving(true);
        try {
            await levelApi.update(editing.level, {
                threshold: Number(threshold),
                perks,
            });
            toast.success('Nivel actualizado');
            setEditing(null);
            load();
        } catch {
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 className="page-title">Configuración de Niveles</h1>
                <p className="page-subtitle">Editá los umbrales de puntos y beneficios por nivel</p>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)', padding: 32 }}>Cargando...</div>
            ) : (
                <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
                    {configs.map((cfg) => {
                        const meta = LEVEL_META[cfg.level] ?? { label: cfg.level, icon: '⭐', color: '#888' };
                        return (
                            <div key={cfg.level} className="card" style={{ borderColor: `${meta.color}30` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{
                                            width: 48, height: 48,
                                            background: `${meta.color}20`,
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 22,
                                        }}>
                                            {meta.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: meta.color }}>{meta.label}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                Desde{' '}
                                                <span style={{ color: 'var(--green-primary)', fontWeight: 600 }}>
                                                    {cfg.threshold.toLocaleString()} puntos
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '6px 14px', fontSize: 12 }}
                                        onClick={() => openEdit(cfg)}
                                    >
                                        Editar
                                    </button>
                                </div>

                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-card)' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Beneficios
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {cfg.perks.length === 0 ? (
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin beneficios configurados</span>
                                        ) : cfg.perks.map((perk, i) => (
                                            <span key={i} style={{
                                                padding: '4px 10px',
                                                background: `${meta.color}15`,
                                                border: `1px solid ${meta.color}30`,
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: 12,
                                                color: meta.color,
                                            }}>
                                                {perk}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {editing && createPortal(
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                    onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
                >
                    <div className="card" style={{ width: 480, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
                        {(() => {
                            const meta = LEVEL_META[editing.level] ?? { label: editing.level, icon: '⭐', color: '#888' };
                            return (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                        <span style={{ fontSize: 28 }}>{meta.icon}</span>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, color: meta.color }}>
                                            Editar nivel {meta.label}
                                        </h2>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                        {/* Umbral */}
                                        <div>
                                            <label className="form-label">
                                                Puntos mínimos para alcanzar este nivel
                                            </label>
                                            {editing.level === 'BRONZE' ? (
                                                <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '10px 0' }}>
                                                    Bronce es el nivel inicial — siempre empieza en 0 puntos.
                                                </div>
                                            ) : (
                                                <input
                                                    className="form-input"
                                                    type="number"
                                                    min={1}
                                                    value={threshold}
                                                    onChange={e => setThreshold(e.target.value)}
                                                />
                                            )}
                                        </div>

                                        {/* Beneficios */}
                                        <div>
                                            <label className="form-label">Beneficios</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                                                {perks.length === 0 && (
                                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin beneficios. Agregá uno abajo.</div>
                                                )}
                                                {perks.map((perk, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{
                                                            flex: 1, padding: '8px 12px', fontSize: 13,
                                                            background: 'var(--bg-input)',
                                                            border: '1px solid var(--border-card)',
                                                            borderRadius: 8,
                                                            color: 'var(--text-primary)',
                                                        }}>
                                                            {perk}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removePerk(i)}
                                                            style={{
                                                                background: 'rgba(239,68,68,0.1)',
                                                                border: '1px solid rgba(239,68,68,0.3)',
                                                                color: '#ef4444',
                                                                borderRadius: 6,
                                                                padding: '6px 10px',
                                                                cursor: 'pointer',
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Agregar nuevo beneficio */}
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <input
                                                    className="form-input"
                                                    placeholder="Nuevo beneficio..."
                                                    value={newPerk}
                                                    onChange={e => setNewPerk(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPerk(); } }}
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn-ghost"
                                                    onClick={addPerk}
                                                    style={{ padding: '0 16px', fontSize: 18, lineHeight: 1 }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Botones */}
                                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                            <button
                                                className="btn-primary"
                                                onClick={handleSave}
                                                disabled={saving}
                                                style={{ flex: 1 }}
                                            >
                                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-ghost"
                                                onClick={() => setEditing(null)}
                                                style={{ flex: 1 }}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
