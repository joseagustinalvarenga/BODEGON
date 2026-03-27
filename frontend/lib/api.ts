import axios from 'axios';
import type {
    AuthRequest,
    RegisterRequest,
    AuthResponse,
    MemberProfile,
    PointsTransaction,
    PageResponse,
    Reward,
    Promotion,
    Redemption,
    MemberRedemption,
    AdminMember,
    AdminRedemption,
    AdminStats,
} from './types';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// On 401/403 with no body (expired/missing token) → clear auth and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const hasBody = error?.response?.data && Object.keys(error.response.data).length > 0;
        if ((status === 401 || status === 403) && !hasBody && typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Backend returns snake_case: access_token, refresh_token
interface BackendAuthResponse {
    access_token: string;
    refresh_token: string;
}

const mapAuthResponse = (r: BackendAuthResponse): AuthResponse => ({
    accessToken: r.access_token,
    refreshToken: r.refresh_token,
    tokenType: 'Bearer',
    role: '',   // enrichAuthResponse en auth-context lo completa desde el JWT
    email: '',  // idem
});

// Auth
export const authApi = {
    login: (data: AuthRequest) =>
        api.post<BackendAuthResponse>('/auth/login', data).then((r) => mapAuthResponse(r.data)),
    register: (data: RegisterRequest) => {
        // Backend expects fullName (single field), not firstName/lastName
        const payload = {
            fullName: `${data.firstName} ${data.lastName}`.trim(),
            email: data.email,
            password: data.password,
            phone: data.phone || undefined,
            dni: data.dni || undefined,
            birthDate: data.birthDate || undefined,
        };
        return api.post<BackendAuthResponse>('/auth/register', payload).then((r) => mapAuthResponse(r.data));
    },
};

// Member
export const memberApi = {
    getProfile: () =>
        api.get<MemberProfile>('/members/me').then((r) => r.data),
    updateProfile: (data: { fullName?: string; phone?: string; birthDate?: string }) =>
        api.put<MemberProfile>('/members/me', data).then((r) => r.data),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.put('/members/me/password', { currentPassword, newPassword }),
    getTransactions: (page = 0, size = 10) =>
        api
            .get<PageResponse<PointsTransaction>>('/members/me/transactions', {
                params: { page, size },
            })
            .then((r) => r.data),
    getRedemptions: () =>
        api.get<MemberRedemption[]>('/members/me/redemptions').then((r) => r.data),
};

// Promotions
export const promotionApi = {
    getPublic: () =>
        api.get<Promotion[]>('/promotions/public').then((r) => r.data),
    getForMember: () =>
        api.get<Promotion[]>('/promotions').then((r) => r.data),
    create: (data: Partial<Promotion>) =>
        api.post<Promotion>('/promotions', data).then((r) => r.data),
    update: (id: string, data: Partial<Promotion>) =>
        api.put<Promotion>(`/promotions/${id}`, data).then((r) => r.data),
};

// Rewards
export const rewardApi = {
    getAll: () => api.get<Reward[]>('/rewards').then((r) => r.data),
    getAllAdmin: () => api.get<Reward[]>('/rewards/all').then((r) => r.data),
    create: (data: Partial<Reward>) =>
        api.post<Reward>('/rewards', data).then((r) => r.data),
    update: (id: string, data: Partial<Reward>) =>
        api.put<Reward>(`/rewards/${id}`, data).then((r) => r.data),
    toggle: (id: string) =>
        api.patch<Reward>(`/rewards/${id}/toggle`).then((r) => r.data),
};

// Redemptions
export const redemptionApi = {
    redeem: (rewardId: string) =>
        api.post<Redemption>('/redemptions', { rewardId }).then((r) => r.data),
};

// Admin
export const adminApi = {
    getMembers: () =>
        api.get<AdminMember[]>('/admin/members').then((r) => r.data),
    adjustPoints: (memberId: string, points: number, description: string) =>
        api.post(`/admin/members/${memberId}/points`, { points, description }),
    getRedemptions: () =>
        api.get<AdminRedemption[]>('/admin/redemptions').then((r) => r.data),
    validateRedemption: (code: string) =>
        api.post<AdminRedemption>(`/admin/redemptions/validate/${code}`).then((r) => r.data),
    getStats: () =>
        api.get<AdminStats>('/admin/stats').then((r) => r.data),
};

export default api;
