"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COOKIE_NAMES = void 0;
exports.getCookieOptions = getCookieOptions;
exports.authTokenCookieOptions = authTokenCookieOptions;
function getCookieOptions(isProd, overrides) {
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        ...overrides,
    };
}
function authTokenCookieOptions(isProd) {
    return getCookieOptions(isProd, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
exports.COOKIE_NAMES = {
    AUTH_TOKEN: 'authToken',
};
//# sourceMappingURL=cookie.config.js.map