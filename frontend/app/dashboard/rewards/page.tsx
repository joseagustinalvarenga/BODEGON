'use client';
import { useEffect, useState } from 'react';
import { rewardApi, redemptionApi } from '@/lib/api';
import type { Reward } from '@/lib/types';
import toast from 'react-hot-toast';
import { memberApi } from '@/lib/api';

export default function RewardsPage() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPts, setUserPts] = useState(0);
    const [redeeming, setRedeeming] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([rewardApi.getAll(), memberApi.getProfile()])
            .then(([r, p]) => {
                setRewards(r);
                setUserPts(p.currentPoints);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleRedeem = async (reward: Reward) => {
        if (userPts < reward.pointsCost) {
            toast.error(`Te faltan ${reward.pointsCost - userPts} puntos`);
            return;
        }
        setRedeeming(reward.id);
        try {
            await redemptionApi.redeem(reward.id);
            toast.success(`¡${reward.name} canjeado exitosamente!`);
            setUserPts((p) => p - reward.pointsCost);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e?.response?.data?.message || 'Error al canjear');
        } finally {
            setRedeeming(null);
        }
    };

    return (
        <div className="page-container fade-in" style={{ padding: 32 }}>
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}
            >
                <div>
                    <h1 className="page-title">Catálogo de Recompensas</h1>
                    <p className="page-subtitle">Canjeá tus puntos por premios increíbles</p>
                </div>
                <div className="card" style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>MIS PUNTOS</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-primary)' }}>
                        {userPts.toLocaleString()}
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)', padding: 32 }}>Cargando recompensas...</div>
            ) : rewards.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                        No hay recompensas disponibles aún.
                    </div>
                </div>
            ) : (
                <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}
                >
                    {rewards.map((r) => {
                        const canAfford = userPts >= r.pointsCost;
                        return (
                            <div
                                key={r.id}
                                className="reward-card"
                                style={{ opacity: canAfford ? 1 : 0.6, position: 'relative' }}
                            >
                                <div
                                    className="reward-img"
                                    style={{
                                        background: canAfford
                                            ? 'linear-gradient(135deg, #0e1a10, #152318)'
                                            : 'var(--bg-hover)',
                                        height: 140,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 48,
                                    }}
                                >
                                    🎁
                                </div>
                                {!canAfford && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            background: 'rgba(0,0,0,0.8)',
                                            color: '#ef4444',
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: '3px 8px',
                                            borderRadius: 6,
                                            border: '1px solid rgba(239,68,68,0.3)',
                                        }}
                                    >
                                        PUNTOS INSUFICIENTES
                                    </div>
                                )}
                                <div className="reward-body">
                                    <div className="reward-name">{r.name}</div>
                                    <div className="reward-desc">{r.description}</div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginTop: 12,
                                        }}
                                    >
                                        <div className="reward-cost">{r.pointsCost.toLocaleString()} pts</div>
                                        <button
                                            className="btn-primary"
                                            style={{ padding: '8px 16px', fontSize: 12 }}
                                            disabled={!canAfford || redeeming === r.id}
                                            onClick={() => handleRedeem(r)}
                                        >
                                            {redeeming === r.id ? '...' : 'Canjear'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
