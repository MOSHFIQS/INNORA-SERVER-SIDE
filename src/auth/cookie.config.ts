import { CookieOptions } from 'express';

export function getCookieOptions(
     isProd: boolean,
     overrides?: Partial<CookieOptions>,
): CookieOptions {
     return {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          path: '/',
          ...overrides,
     };
}

export function authTokenCookieOptions(isProd: boolean): CookieOptions {
     return getCookieOptions(isProd, {
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     });
}

export const COOKIE_NAMES = {
     AUTH_TOKEN: 'authToken',
} as const;
