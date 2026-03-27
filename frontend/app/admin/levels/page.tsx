'use client';
import toast from 'react-hot-toast';

const levels = [
    { name: 'Bronce', icon: '🥉', color: '#b4865a', threshold: 0, perks: ['2x puntos en cumpleaños', 'Acceso a promociones básicas'] },
    { name: 'Plata', icon: '🥈', color: '#94a3b8', threshold: 1000, perks: ['Todo lo de Bronce', '3x puntos especiales', 'Descuentos exclusivos'] },
    { name: 'Oro', icon: '🥇', color: '#fbbf24', threshold: 5000, perks: ['Todo lo de Plata', '5x puntos', 'Acceso VIP', "Chef's table"] },
];

export default function AdminLevelsPage() {
    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <h1 className="page-title">Configuración de Niveles</h1>
            <p className="page-subtitle">Umbrales de puntos y beneficios por nivel</p>

            <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
                {levels.map((level) => (
                    <div
                        key={level.name}
                        className="card"
                        style={{ borderColor: `${level.color}30` }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        background: `${level.color}20`,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 22,
                                    }}
                                >
                                    {level.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: level.color }}>{level.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        Desde{' '}
                                        <span style={{ color: 'var(--green-primary)', fontWeight: 600 }}>
                                            {level.threshold.toLocaleString()} puntos
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="btn-ghost"
                                style={{ padding: '6px 14px', fontSize: 12 }}
                                onClick={() => toast.success('Editor de beneficios próximamente')}
                            >
                                Editar →
                            </button>
                        </div>

                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-card)' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Beneficios
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {level.perks.map((perk) => (
                                    <span
                                        key={perk}
                                        style={{
                                            padding: '4px 10px',
                                            background: `${level.color}15`,
                                            border: `1px solid ${level.color}30`,
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 12,
                                            color: level.color,
                                        }}
                                    >
                                        {perk}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: 24, maxWidth: 720, background: 'var(--bg-input)' }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    ⚙️ Los umbrales de puntos están configurados en{' '}
                    <code style={{ color: 'var(--green-primary)', background: 'var(--green-dim)', padding: '2px 6px', borderRadius: 4 }}>
                        application.yml
                    </code>{' '}
                    bajo{' '}
                    <code style={{ color: 'var(--green-primary)', background: 'var(--green-dim)', padding: '2px 6px', borderRadius: 4 }}>
                        app.business.level
                    </code>
                </div>
            </div>
        </div>
    );
}
