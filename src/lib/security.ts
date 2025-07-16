// Essential security utilities for Basketball Coach App

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/script/gi, '')
    .trim();
};

export const sanitizeObject = (obj: unknown): unknown => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

// Password strength validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Environment variable validation
export const validateEnvVars = () => {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'DATABASE_URL',
    'DIRECT_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Secure error handling
export const createSecureError = (message: string, statusCode: number = 500) => {
  const error = new Error(message);
  (error as { statusCode: number }).statusCode = statusCode;
  return error;
};

// User input validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateTeamName = (name: string): boolean => {
  return name.length >= 1 && name.length <= 100 && /^[a-zA-Z0-9\s\-_]+$/.test(name);
};

export const validatePlayerName = (name: string): boolean => {
  return name.length >= 1 && name.length <= 50 && /^[a-zA-Z\s\-']+$/.test(name);
};

// IP address utilities
export const getClientIP = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1';
};

// Session security
export const generateSecureToken = (): string => {
  return crypto.randomUUID();
};

// Simple authentication attempt tracking (in-memory for development)
// In production, use Supabase's built-in rate limiting
interface AuthAttempt {
  count: number;
  lastAttempt: number;
  isBlocked: boolean;
}

const authAttempts = new Map<string, AuthAttempt>();

export const trackAuthAttempt = (identifier: string): boolean => {
  const now = Date.now();
  const attempt = authAttempts.get(identifier) || { count: 0, lastAttempt: 0, isBlocked: false };
  
  // Reset if more than 15 minutes have passed
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    attempt.count = 0;
    attempt.isBlocked = false;
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  
  // Block after 5 failed attempts
  if (attempt.count >= 5) {
    attempt.isBlocked = true;
  }
  
  authAttempts.set(identifier, attempt);
  return !attempt.isBlocked;
};

export const isAuthBlocked = (identifier: string): boolean => {
  const attempt = authAttempts.get(identifier);
  if (!attempt) return false;
  
  const now = Date.now();
  
  // Reset if more than 15 minutes have passed
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    attempt.isBlocked = false;
    authAttempts.set(identifier, attempt);
    return false;
  }
  
  return attempt.isBlocked;
};

export const clearAuthAttempts = (identifier: string): void => {
  authAttempts.delete(identifier);
};