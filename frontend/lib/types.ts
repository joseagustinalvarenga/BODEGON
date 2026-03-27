// Auth
export interface AuthRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dni?: string;
    birthDate?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    role: string;
    email: string;
}

// Member
export interface MemberProfile {
    userId: string;
    memberId: string;
    fullName: string;
    email: string;
    phone?: string;
    birthDate?: string;
    level: 'BRONZE' | 'SILVER' | 'GOLD';
    currentPoints: number;
    totalPointsEarned: number;
    totalVisits: number;
    memberSince?: string;
}

export interface PointsTransaction {
    id: string;
    type: 'EARN' | 'REDEEM' | 'ADJUST';
    source: string;
    points: number;
    description: string;
    createdAt: string;
}

export interface MemberRedemption {
    id: string;
    code: string;
    rewardName: string;
    pointsSpent: number;
    status: 'ISSUED' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
    issuedAt: string;
    expiresAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// Rewards
export interface Reward {
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    category: string;
    imageUrl?: string;
    active: boolean;
    stock?: number;
}

// Promotions
export interface Promotion {
    id: string;
    title: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED' | 'POINTS_MULTIPLIER';
    discountValue: number;
    startDate: string; // Keep for compatibility if needed
    endDate: string;   // Keep for compatibility if needed
    startAt: string;
    endAt: string;
    type: 'PUBLIC' | 'MEMBERS_ONLY';
    memberOnly: boolean;
    active: boolean;
    imageUrl?: string;
}

// Redemptions
export interface Redemption {
    id: string;
    rewardId: string;
    rewardName: string;
    pointsUsed: number;
    status: 'PENDING' | 'VALIDATED' | 'EXPIRED' | 'CANCELLED';
    createdAt: string;
    expiresAt: string;
    qrCode?: string;
}

// Admin types
export interface AdminMember {
    userId: string;
    memberId: string;
    fullName: string;
    email: string;
    phone?: string;
    level: 'BRONZE' | 'SILVER' | 'GOLD';
    currentPoints: number;
    totalPointsEarned: number;
    totalVisits: number;
    birthDate?: string;
}

export interface AdminRedemption {
    id: string;
    code: string;
    memberName: string;
    memberEmail: string;
    rewardName: string;
    pointsSpent: number;
    status: 'ISSUED' | 'REDEEMED' | 'CANCELLED' | 'EXPIRED';
    issuedAt: string;
    expiresAt: string;
}

export interface AdminStats {
    totalMembers: number;
    bronze: number;
    silver: number;
    gold: number;
    totalPointsIssued: number;
    totalPointsInCirculation: number;
}
