import { CookieOptions } from 'express';
export declare function getCookieOptions(isProd: boolean, overrides?: Partial<CookieOptions>): CookieOptions;
export declare function authTokenCookieOptions(isProd: boolean): CookieOptions;
export declare const COOKIE_NAMES: {
    readonly AUTH_TOKEN: "authToken";
};
