export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  memberTier: 'free' | 'pro' | 'enterprise';
}

export type AuthMode = 'login' | 'signup' | 'otp' | 'biometric';
