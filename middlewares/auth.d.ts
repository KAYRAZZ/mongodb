import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
type UserClaims = JwtPayload & {
    id?: string;
    email?: string;
};
type AuthedRequest = Request & {
    user?: UserClaims;
};
export declare function populateUser(req: AuthedRequest, res: Response, next: NextFunction): void;
export declare function ensureAuth(req: AuthedRequest, res: Response, next: NextFunction): void;
export declare function redirectIfAuthenticated(req: AuthedRequest, res: Response, next: NextFunction): void;
declare const _default: {
    populateUser: typeof populateUser;
    ensureAuth: typeof ensureAuth;
    redirectIfAuthenticated: typeof redirectIfAuthenticated;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map