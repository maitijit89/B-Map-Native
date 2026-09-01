import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const JWT_KEY = 'bmap_jwt_token';
const USER_EMAIL_KEY = 'bmap_user_email';
const USER_PROFILE_KEY = 'bmap_user_profile';

export interface UserProfile {
  fullName: string;
  age: string;
  email: string;
  avatarUrl?: string;
}

// In-memory fallback for web storage when SecureStore is not available
const webStorageFallback: Record<string, string> = {};

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      webStorageFallback[key] = value;
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    webStorageFallback[key] = value;
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key) ?? webStorageFallback[key] ?? null;
    } catch {
      return webStorageFallback[key] ?? null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return webStorageFallback[key] ?? null;
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      delete webStorageFallback[key];
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    delete webStorageFallback[key];
  }
}

let lastRequestTime = 0;
let requestCountInWindow = 0;

export async function requestEmailOtp(email: string): Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }> {
  // Real-time format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const now = Date.now();
  if (now - lastRequestTime < 10000 && requestCountInWindow >= 3) {
    // Simulate HTTP 429 Too Many Requests
    return {
      success: false,
      error: 'HTTP 429: Rate limit exceeded. Please wait 90 seconds before requesting another OTP.',
      retryAfterSeconds: 90,
    };
  }

  if (now - lastRequestTime > 60000) {
    requestCountInWindow = 0;
  }
  requestCountInWindow += 1;
  lastRequestTime = now;

  await setSecureItem(USER_EMAIL_KEY, email.trim());
  return { success: true };
}

export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean; token?: string; error?: string }> {
  if (!otp || otp.length !== 6) {
    return { success: false, error: 'OTP must be 6 digits.' };
  }

  // Accept valid 6 digit OTPs (or standard mock code like 123456)
  const token = `bmap_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  await setSecureItem(JWT_KEY, token);
  await setSecureItem(USER_EMAIL_KEY, email);

  // Initialize profile if not already present
  const existingProfile = await getProfile();
  if (!existingProfile) {
    await saveProfile({
      fullName: 'Aarav Sharma',
      age: '28',
      email: email,
    });
  }

  return { success: true, token };
}

export async function checkAuth(): Promise<{ isAuthenticated: boolean; email?: string }> {
  const token = await getSecureItem(JWT_KEY);
  const email = await getSecureItem(USER_EMAIL_KEY);
  return {
    isAuthenticated: !!token,
    email: email || undefined,
  };
}

export async function logout(): Promise<void> {
  await deleteSecureItem(JWT_KEY);
}

export async function getProfile(): Promise<UserProfile | null> {
  const data = await getSecureItem(USER_PROFILE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as UserProfile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await setSecureItem(USER_PROFILE_KEY, JSON.stringify(profile));
}
