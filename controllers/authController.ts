import { Request, Response, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Db, MongoClient } from 'mongodb';
import User = require('../models/userModel');

type AppLocals = {
    db?: Db;
    mongoClient?: MongoClient;
};

type RequestBody = {
    email?: string;
    password?: string;
    remember?: string | boolean;
    returnTo?: string;
};

const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret';

const getDbs = (req: Request) => {
    const locals = (req.app?.locals || {}) as AppLocals;
    const db = locals.db;
    const mongoClient = locals.mongoClient;
    const usersDb = mongoClient ? mongoClient.db('users') : db;
    return { db, mongoClient, usersDb };
};

export const showLogin = (req: Request, res: Response) => {
    const email = typeof req.query.email === 'string' ? req.query.email : undefined;
    const error = typeof req.query.error === 'string' ? req.query.error : undefined;
    const remember = req.query.remember === 'true';
    const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : undefined;

    return res.render('login', { email, error, remember: !!remember, returnTo });
};

export const login = async (req: Request, res: Response) => {
    const { usersDb } = getDbs(req);
    const { email, password, remember, returnTo } = (req.body || {}) as RequestBody;

    if (!email || !password) {
        return res.render('login', { error: 'Email et mot de passe requis', email, remember: !!remember, returnTo });
    }

    try {
        const user = await User.findByEmail(usersDb as Db, email);
        if (!user) {
            return res.render('login', { error: 'Email ou mot de passe invalide', email, remember: !!remember, returnTo });
        }

        const match = await bcrypt.compare(password, user.password || '');
        if (!match) {
            return res.render('login', { error: 'Email ou mot de passe invalide', email, remember: !!remember, returnTo });
        }

        const payload = { id: user._id.toString(), email: user.email };
        const expiresIn = remember ? 60 * 60 * 24 * 30 : 60 * 60; // seconds
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };
        if (remember) cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;

        res.cookie('token', token, cookieOptions);

        const dest = returnTo || '/';
        return res.redirect(dest);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Login error', message);
        return res.render('login', { error: 'Erreur serveur', email, remember: !!remember, returnTo });
    }
};

export const logout = (req: Request, res: Response) => {
    try {
        res.clearCookie('token');
    } catch (e) {
        // ignore
    }
    return res.redirect('/');
};