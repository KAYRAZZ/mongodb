"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateUser = populateUser;
exports.ensureAuth = ensureAuth;
exports.redirectIfAuthenticated = redirectIfAuthenticated;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret';
// Populate req.user and res.locals.currentUser from a JWT stored in a cookie or Authorization header
function populateUser(req, res, next) {
    const authHeader = req.get('Authorization');
    const bearer = authHeader && authHeader.split(' ')[1];
    const token = (req.cookies && req.cookies.token) || bearer;
    if (!token) {
        res.locals.currentUser = null;
        return next();
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        res.locals.currentUser = payload;
    }
    catch (err) {
        res.locals.currentUser = null;
    }
    return next();
}
function ensureAuth(req, res, next) {
    if (req.user)
        return next();
    const returnTo = req.originalUrl || req.url;
    return res.redirect('/login?returnTo=' + encodeURIComponent(returnTo));
}
function redirectIfAuthenticated(req, res, next) {
    if (req.user)
        return res.redirect('/');
    return next();
}
exports.default = {
    populateUser,
    ensureAuth,
    redirectIfAuthenticated
};
//# sourceMappingURL=auth.js.map