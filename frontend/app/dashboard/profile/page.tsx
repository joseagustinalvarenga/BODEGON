'use client';
import { useEffect, useState } from 'react';
import { memberApi } from '@/lib/api';
import type { MemberProfile } from '@/lib/types';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const [profile, setProfile] = useState<MemberProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ fullName: '', phone: '', birthDate: '' });

    useEffect(() => {
        memberApi.getProfile().then((p) => {
            setProfile(p);
            setForm({ fullName: p.fullName, phone: p.phone ?? '', birthDate: p.birthDate ?? '' });
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await memberApi.updateProfile({
                fullName: form.fullName,
                phone: form.phone || undefined,
                birthDate: form.birthDate || undefined,
            });
            setProfile(updated);
            toast.success('Perfil actualizado');
        } catch {
            toast.error('Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Cargando perfil...</div>;

    const levelColors = { GOLD: '#fbbf24', SILVER: '#94a3b8', BRONZE: '#b4865a' };
    const levelIcons  = { GOLD: '🥇', SILVER: '🥈', BRONZE: '🥉' };
    const levelLabels = { GOLD: 'Oro', SILVER: 'Plata', BRONZE: 'Bronce' };
    const level = profile?.level ?? 'BRONZE';

    return (
        <div className="page-container fade-in" style={{ padding: 32, maxWidth: 800 }}>
            <h1 className="page-title">Mi Perfil</h1>
            <p className="page-subtitle">Gestioná tu información personal</p>

            {/* Level badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', background: 'var(--bg-card)', border: `1px solid ${levelColors[level]}40`, borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: `${levelColors[level]}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                    {levelIcons[level]}
                </div>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{profile?.fullName}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{profile?.email}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                        <span style={{ color: levelColors[level], fontWeight: 600, fontSize: 13 }}>Nivel {levelLabels[level]}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>·</span>
                        <span style={{ color: 'var(--green-primary)', fontWeight: 700, fontSize: 13 }}>{(profile?.currentPoints ?? 0).toLocaleString()} pts</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>·</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{profile?.totalVisits ?? 0} visitas</span>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Información Personal</h2>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="form-label">Nombre completo</label>
                        <input
                            className="input-field"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="input-field" value={profile?.email ?? ''} disabled style={{ opacity: 0.5 }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Teléfono</label>
                            <input
                                className="input-field"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+54 11..."
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Fecha de Nacimiento</label>
                            <input
                                className="input-field"
                                type="date"
                                value={form.birthDate}
                                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                        <button className="btn-primary" type="submit" disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button className="btn-ghost" type="button" onClick={() => profile && setForm({ fullName: profile.fullName, phone: profile.phone ?? '', birthDate: profile.birthDate ?? '' })}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
