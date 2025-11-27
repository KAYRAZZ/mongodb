const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

exports.showLogin = (req, res) => {
    const email = req.query.email || undefined;
    const error = req.query.error || undefined;
    const remember = req.query.remember === 'true';
    const returnTo = req.query.returnTo || undefined;
    res.render('login', { email, error, remember: !!remember, returnTo });
};

exports.login = async (req, res) => {
    const db = req.app && req.app.locals && req.app.locals.db;
    const mongoClient = req.app && req.app.locals && req.app.locals.mongoClient;
    const usersDb = mongoClient ? mongoClient.db('users') : db;
    const { email, password, remember, returnTo } = req.body || {};
    if (!email || !password) {
        return res.render('login', { error: 'Email et mot de passe requis', email, remember: !!remember, returnTo });
    }
    try {
        const user = await User.findByEmail(usersDb, email);
        if (!user) {
            return res.render('login', { error: 'Email ou mot de passe invalide', email, remember: !!remember, returnTo });
        }
        const match = await bcrypt.compare(password, user.password || '');
        if (!match) {
            return res.render('login', { error: 'Email ou mot de passe invalide', email, remember: !!remember, returnTo });
        }

        const payload = { id: user._id.toString(), email: user.email };
        const signOptions = remember ? { expiresIn: '30d' } : { expiresIn: '1h' };
        const token = jwt.sign(payload, JWT_SECRET, signOptions);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };
        if (remember) cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;

        res.cookie('token', token, cookieOptions);

        // redirect back to the page the user originally requested, if any
        const dest = returnTo || '/';
        return res.redirect(dest);
    } catch (err) {
        console.error('Login error', err && err.message);
        return res.render('login', { error: 'Erreur serveur', email, remember: !!remember, returnTo });
    }
};

exports.logout = (req, res) => {
    try { res.clearCookie('token'); } catch (e) { }
    return res.redirect('/');
};
