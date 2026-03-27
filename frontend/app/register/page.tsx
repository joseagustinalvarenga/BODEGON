'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        dni: '',
        birthDate: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('¡Bienvenido al Club del Bodegón!');
            router.push('/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--bg-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 24px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'fixed',
                    top: '30%',
                    right: '20%',
                    width: 500,
                    height: 500,
                    background: 'radial-gradient(circle, rgba(19,236,55,0.05) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            <div style={{ width: '100%', maxWidth: 480 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link href="/">
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                background: 'var(--green-dim)',
                                border: '1px solid var(--green-border)',
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 26,
                                margin: '0 auto 12px',
                            }}
                        >
                            🍷
                        </div>
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Únete al Club
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        Creá tu cuenta y empezá a ganar puntos hoy
                    </p>
                </div>

                <div className="card" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
                        Datos Personales
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Nombre *</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Juan"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Apellido *</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Pérez"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label className="form-label">Correo electrónico *</label>
                            <input
                                className="input-field"
                                type="email"
                                placeholder="tu@email.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña *</label>
                            <input
                                className="input-field"
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Teléfono</label>
                                <input
                                    className="input-field"
                                    type="tel"
                                    placeholder="+54 11..."
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">DNI</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="12345678"
                                    value={form.dni}
                                    onChange={(e) => setForm({ ...form, dni: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label className="form-label">Fecha de Nacimiento</label>
                            <input
                                className="input-field"
                                type="date"
                                value={form.birthDate}
                                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        <div
                            style={{
                                background: 'var(--green-dim)',
                                border: '1px solid var(--green-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px 16px',
                                marginBottom: 20,
                                fontSize: 12,
                                color: 'var(--text-secondary)',
                            }}
                        >
                            Al registrarte aceptás los{' '}
                            <a href="#" style={{ color: 'var(--green-primary)' }}>
                                Términos y Condiciones
                            </a>{' '}
                            y la{' '}
                            <a href="#" style={{ color: 'var(--green-primary)' }}>
                                Política de Privacidad
                            </a>
                            .
                        </div>

                        <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Creando cuenta...' : 'Crear mi Cuenta'}
                        </button>
                    </form>

                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                            paddingTop: 20,
                            borderTop: '1px solid var(--border-card)',
                            fontSize: 13,
                            color: 'var(--text-muted)',
                        }}
                    >
                        ¿Ya sos miembro?{' '}
                        <Link href="/login" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>
                            Ingresar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
