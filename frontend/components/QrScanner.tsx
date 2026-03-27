'use client';
import { useEffect, useRef, useState } from 'react';

interface QrScannerProps {
    onScan: (code: string) => void;
    onClose: () => void;
}

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
    const divId = 'html5-qr-reader';
    const hasFiredRef = useRef(false);
    const [error, setError] = useState<string>('');
    const [started, setStarted] = useState(false);

    useEffect(() => {
        let ignore = false;
        let html5QrCode: { stop: () => Promise<void>; clear: () => void; isScanning: boolean } | null = null;

        const startScanner = async () => {
            try {
                const { Html5Qrcode } = await import('html5-qrcode');
                if (ignore) return;

                html5QrCode = new Html5Qrcode(divId);
                if (ignore) return;

                try {
                    await html5QrCode.start(
                        { facingMode: 'environment' }, // Usa cámara trasera si existe
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        (decodedText) => {
                            if (hasFiredRef.current) return;
                            hasFiredRef.current = true;
                            
                            if (html5QrCode) {
                                html5QrCode.stop()
                                    .catch(() => {})
                                    .finally(() => {
                                        if (html5QrCode) html5QrCode.clear();
                                        onScan(decodedText);
                                    });
                            } else {
                                onScan(decodedText);
                            }
                        },
                        () => {} // ignorar errores de frame
                    );

                    if (ignore && html5QrCode) {
                        try {
                            if (html5QrCode.isScanning) await html5QrCode.stop();
                            html5QrCode.clear();
                        } catch {
                            // ignore cleanup errors
                        }
                    } else {
                        setStarted(true);
                    }
                } catch (startErr: unknown) {
                    if (!ignore) {
                        throw startErr;
                    }
                }
            } catch (err: unknown) {
                if (ignore) return;
                const msg = err instanceof Error ? err.message : String(err);
                if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notfound')) {
                    setError('Permiso denegado o cámara no encontrada. Verificá tu navegador/dispositivo.');
                } else {
                    setError(`Error de cámara: ${msg}`);
                }
            }
        };

        startScanner();

        return () => {
            ignore = true;
            if (html5QrCode) {
                try {
                    if (html5QrCode.isScanning) {
                        html5QrCode.stop()
                            .then(() => html5QrCode?.clear())
                            .catch(() => {});
                    } else {
                        html5QrCode.clear();
                    }
                } catch {
                    // ignore cleanup errors
                }
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.88)',
                zIndex: 500,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}
        >
            <div
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: 16,
                    border: '1px solid rgba(122,170,138,0.25)',
                    padding: 28,
                    maxWidth: 400,
                    width: '100%',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Escáner QR
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Apuntá la cámara al QR
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Se detectará automáticamente al enfocar el código.
                </p>

                {error ? (
                    <div
                        style={{
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 10,
                            padding: 16,
                            color: '#ef4444',
                            fontSize: 13,
                            marginBottom: 20,
                        }}
                    >
                        {error}
                    </div>
                ) : (
                    <div style={{ position: 'relative', marginBottom: 20 }}>
                        <div
                            id={divId}
                            style={{
                                borderRadius: 12,
                                overflow: 'hidden',
                                border: '2px solid rgba(122,170,138,0.4)',
                                minHeight: started ? undefined : 200,
                                background: 'var(--bg-input)',
                            }}
                        />
                        {!started && (
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-muted)', fontSize: 13,
                            }}>
                                Iniciando cámara...
                            </div>
                        )}
                    </div>
                )}

                <button onClick={onClose} className="btn-ghost" style={{ width: '100%' }}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}
