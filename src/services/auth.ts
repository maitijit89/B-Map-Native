import { AuthAPI } from '@/api/api';
import {
  saveAuthTokens,
  clearAuthTokens,
  getStoredItem,
  setStoredItem,
  ACCESS_TOKEN_KEY,
} from '@/api/client';

export interface UserProfile {
  fullName: string;
  age: string;
  email: string;
  avatarUrl?: string;
}

const CACHED_PROFILE_KEY = 'bmap_cached_profile';
const LAST_EMAIL_KEY = 'bmap_last_email';

export async function requestEmailOtp(
  email: string
): Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }> {
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed || !emailRegex.test(trimmed)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const res = await AuthAPI.requestOTP(trimmed);
    await setStoredItem(LAST_EMAIL_KEY, trimmed);
    return {
      success: true,
      retryAfterSeconds: res.data?.meta?.cooldown_seconds,
    };
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Failed to request verification code';
    const retryAfter = err.response?.data?.meta?.cooldown_seconds;
    return {
      success: false,
      error: errorMsg,
      retryAfterSeconds: retryAfter,
    };
  }
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const trimmedEmail = email.trim();
  const trimmedOtp = otp.trim();

  if (!trimmedOtp || trimmedOtp.length !== 6) {
    return { success: false, error: 'OTP must be 6 digits.' };
  }

  try {
    const res = await AuthAPI.verifyOTP({
      email: trimmedEmail,
      otp: trimmedOtp,
    });

    const data = res.data?.data;
    if (data?.tokens) {
      await saveAuthTokens(data.tokens);
    }

    if (data?.user) {
      const userProfile: UserProfile = {
        fullName: data.user.name || trimmedEmail.split('@')[0],
        age: data.user.age?.toString() || '25',
        email: data.user.email || trimmedEmail,
        avatarUrl: data.user.avatar_url,
      };
      await setStoredItem(CACHED_PROFILE_KEY, JSON.stringify(userProfile));
    }

    return {
      success: true,
      token: data?.tokens?.access_token,
    };
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Invalid verification code.';
    return { success: false, error: errorMsg };
  }
}

export async function checkAuth(): Promise<{ isAuthenticated: boolean; email?: string }> {
  const token = await getStoredItem(ACCESS_TOKEN_KEY);
  const email = await getStoredItem(LAST_EMAIL_KEY);
  if (!token) {
    return { isAuthenticated: false };
  }

  // Token exists — optionally verify /auth/me in background
  return {
    isAuthenticated: true,
    email: email || undefined,
  };
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = await getStoredItem('bmap_refresh_token');
    await AuthAPI.logout(refreshToken || undefined);
  } catch {
    // Non-blocking logout network error
  } finally {
    await clearAuthTokens();
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const res = await AuthAPI.getProfile();
    const user = res.data?.data?.user;
    if (user) {
      const profile: UserProfile = {
        fullName: user.name,
        age: user.age?.toString() || '',
        email: user.email,
        avatarUrl: user.avatar_url,
      };
      await setStoredItem(CACHED_PROFILE_KEY, JSON.stringify(profile));
      return profile;
    }
  } catch {
    // Fallback to locally cached profile
  }

  const cached = await getStoredItem(CACHED_PROFILE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as UserProfile;
    } catch {
      return null;
    }
  }
  return null;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await setStoredItem(CACHED_PROFILE_KEY, JSON.stringify(profile));
  try {
    await AuthAPI.updateProfile({
      name: profile.fullName,
      age: profile.age ? parseInt(profile.age, 10) : undefined,
      avatar_url: profile.avatarUrl,
    });
  } catch {
    // Cached locally if offline
  }
}
