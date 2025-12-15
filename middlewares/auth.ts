import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

type UserClaims = JwtPayload & { id?: string; email?: string };
type AuthedRequest = Request & { user?: UserClaims };

const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret';

// Populate req.user and res.locals.currentUser from a JWT stored in a cookie or Authorization header
export function populateUser(req: AuthedRequest, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization');
    const bearer = authHeader && authHeader.split(' ')[1];
    const token = (req.cookies && req.cookies.token) || bearer;

    if (!token) {
        res.locals.currentUser = null;
        return next();
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as UserClaims;
        req.user = payload;
        res.locals.currentUser = payload;
    } catch (err) {
        res.locals.currentUser = null;
    }

    return next();
}

export function ensureAuth(req: AuthedRequest, res: Response, next: NextFunction) {
    if (req.user) return next();
    const returnTo = req.originalUrl || req.url;
    return res.redirect('/login?returnTo=' + encodeURIComponent(returnTo));
}

export function redirectIfAuthenticated(req: AuthedRequest, res: Response, next: NextFunction) {
    if (req.user) return res.redirect('/');
    return next();
}

export default {
    populateUser,
    ensureAuth,
    redirectIfAuthenticated
};