'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from './api';
import type { AuthResponse, AuthRequest, RegisterRequest } from './types';

interface AuthContextValue {
    user: AuthResponse | null;
    loading: boolean;
    login: (data: AuthRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Decode a JWT and return its payload as an object */
function decodeJwt(token: string): Record<string, unknown> {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return {};
    }
}

/** Enrich the auth response with role + email extracted from the JWT */
function enrichAuthResponse(res: AuthResponse): AuthResponse {
    const payload = decodeJwt(res.accessToken);
    // Spring Security stores role as ROLE_MEMBER or ROLE_ADMIN
    const authorities = (payload.authorities as string[] | undefined)
        ?? (payload.roles as string[] | undefined)
        ?? [];
    const role = authorities.find((a) => a.includes('ADMIN')) ? 'ADMIN' : 'MEMBER';
    const email = (payload.sub as string) ?? res.email ?? '';
    return { ...res, role, email };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('authUser');
        if (stored) setUser(JSON.parse(stored));
        setLoading(false);
    }, []);

    const login = async (data: AuthRequest) => {
        const raw = await authApi.login(data);
        const res = enrichAuthResponse(raw);
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('authUser', JSON.stringify(res));
        setUser(res);
    };

    const register = async (data: RegisterRequest) => {
        const raw = await authApi.register(data);
        const res = enrichAuthResponse(raw);
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('authUser', JSON.stringify(res));
        setUser(res);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('authUser');
        setUser(null);
    };

    const isAdmin = () => user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
