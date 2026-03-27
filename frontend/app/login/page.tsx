'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form);
            toast.success('¡Bienvenido al Club!');
            const stored = localStorage.getItem('authUser');
            const user = stored ? JSON.parse(stored) : null;
            if (user?.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error(error?.response?.data?.message || error?.message || 'Error de conexión');
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
                padding: 24,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: 'fixed',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    height: 600,
                    background: 'radial-gradient(circle, rgba(122,170,138,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link href="/">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/image.png"
                            alt="el Bodegón"
                            style={{ width: 200, height: 'auto', borderRadius: 10, margin: '0 auto 16px', display: 'block', cursor: 'pointer' }}
                        />
                    </Link>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Acceso exclusivo para miembros</p>
                </div>

                {/* Form card */}
                <div className="card" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
                        Entrar al Club
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
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
                            <label className="form-label">Contraseña</label>
                            <input
                                className="input-field"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, marginTop: -8 }}>
                            <a href="#" style={{ fontSize: 12, color: 'var(--green-primary)' }}>
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                        <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Ingresando...' : '→ Ingresar'}
                        </button>
                    </form>
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 24,
                            paddingTop: 24,
                            borderTop: '1px solid var(--border-card)',
                            fontSize: 13,
                            color: 'var(--text-muted)',
                        }}
                    >
                        ¿Nuevo en el Club?{' '}
                        <Link href="/register" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>
                            Crear cuenta
                        </Link>
                    </div>
                </div>

                {/* Links */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 24,
                        marginTop: 24,
                        fontSize: 12,
                        color: 'var(--text-muted)',
                    }}
                >
                    {['Privacidad', 'Términos', 'Contacto'].map((t) => (
                        <a key={t} href="#">
                            {t}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
