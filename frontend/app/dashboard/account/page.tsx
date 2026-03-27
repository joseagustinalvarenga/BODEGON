'use client';
import { useState } from 'react';
import { memberApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AccountPage() {
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [saving, setSaving] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPw !== pwForm.confirm) {
            toast.error('Las contraseñas nuevas no coinciden');
            return;
        }
        if (pwForm.newPw.length < 6) {
            toast.error('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }
        setSaving(true);
        try {
            await memberApi.changePassword(pwForm.current, pwForm.newPw);
            toast.success('Contraseña actualizada correctamente');
            setPwForm({ current: '', newPw: '', confirm: '' });
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e?.response?.data?.message || 'Error al cambiar la contraseña');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container fade-in" style={{ padding: 32, maxWidth: 700 }}>
            <h1 className="page-title">Cuenta & Seguridad</h1>
            <p className="page-subtitle">Administrá la seguridad de tu cuenta</p>

            {/* Change password */}
            <div className="card" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                    🔒 Cambiar Contraseña
                </h2>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label className="form-label">Contraseña Actual</label>
                        <input className="input-field" type="password" placeholder="••••••••" required value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nueva Contraseña</label>
                        <input className="input-field" type="password" placeholder="••••••••" required value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirmar Nueva Contraseña</label>
                        <input className="input-field" type="password" placeholder="••••••••" required value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
                    </div>
                    <button className="btn-primary" type="submit" disabled={saving}>
                        {saving ? 'Guardando...' : 'Actualizar Contraseña'}
                    </button>
                </form>
            </div>

            {/* Notifications (UI only — no backend yet) */}
            <div className="card" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>🔔 Notificaciones</h2>
                {[
                    { label: 'Nuevas promociones', desc: 'Recibí alertas de ofertas exclusivas', defaultChecked: true },
                    { label: 'Puntos ganados', desc: 'Notificación cuando sumás puntos', defaultChecked: true },
                    { label: 'Puntos por vencer', desc: 'Aviso antes de que venzan tus puntos', defaultChecked: false },
                ].map((n) => (
                    <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-card)' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{n.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.desc}</div>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                            <input type="checkbox" defaultChecked={n.defaultChecked} style={{ opacity: 0, width: 0, height: 0 }} onChange={() => toast.success('Preferencia guardada')} />
                            <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, background: n.defaultChecked ? 'var(--green-primary)' : 'var(--bg-hover)', borderRadius: 24, transition: '0.3s' }}>
                                <span style={{ position: 'absolute', height: 18, width: 18, left: 3, bottom: 3, background: '#fff', borderRadius: '50%', transition: '0.3s', transform: n.defaultChecked ? 'translateX(20px)' : 'none' }} />
                            </span>
                        </label>
                    </div>
                ))}
            </div>

            {/* Danger zone */}
            <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>⚠️ Zona de Peligro</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    Esta acción eliminará permanentemente tu cuenta y todos tus puntos acumulados.
                </p>
                <button className="btn-ghost" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }} onClick={() => toast.error('Contactá al soporte para eliminar tu cuenta')}>
                    Eliminar mi cuenta
                </button>
            </div>
        </div>
    );
}
