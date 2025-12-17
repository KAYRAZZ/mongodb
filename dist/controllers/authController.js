"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.showLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User = require("../models/userModel");
const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret';
const getDbs = (req) => {
    const locals = (req.app?.locals || {});
    const db = locals.db;
    const mongoClient = locals.mongoClient;
    const usersDb = mongoClient ? mongoClient.db('users') : db;
    return { db, mongoClient, usersDb };
};
const showLogin = (req, res) => {
    const email = typeof req.query.email === 'string' ? req.query.email : undefined;
    const error = typeof req.query.error === 'string' ? req.query.error : undefined;
    const remember = req.query.remember === 'true';
    const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : undefined;
    return res.render('login', { email, error, remember: !!remember, returnTo });
};
exports.showLogin = showLogin;
const login = async (req, res) => {
    const { usersDb } = getDbs(req);
    const { email, password, remember, returnTo } = (req.body || {});
    if (!email || !password) {
        return res.render('login', { error: 'Email et mot de passe requis', email, remember: !!remember, returnTo });
    }
    try {
        const user = await User.findByEmail(usersDb, email);
        if (!user) {
            return res.render('login', { error: 'Email ou mot de passe invalide', email, remember: !!remember, returnTo });
        }
        const match = await bcryptjs_1.default.compare(password, user.password || '');
        if (!match) {
            return res.render('login', { error: 'Email ou mot de passe invalide', email, remember: !!remember, returnTo });
        }
        const payload = { id: user._id.toString(), email: user.email };
        const expiresIn = remember ? 60 * 60 * 24 * 30 : 60 * 60; // seconds
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };
        if (remember)
            cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;
        res.cookie('token', token, cookieOptions);
        const dest = returnTo || '/';
        return res.redirect(dest);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Login error', message);
        return res.render('login', { error: 'Erreur serveur', email, remember: !!remember, returnTo });
    }
};
exports.login = login;
const logout = (req, res) => {
    try {
        res.clearCookie('token');
    }
    catch (e) {
        // ignore
    }
    return res.redirect('/');
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map