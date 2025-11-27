const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

module.exports = {
    // Populate req.user and res.locals.currentUser from a JWT stored in a cookie
    populateUser: function (req, res, next) {
        const token = (req.cookies && req.cookies.token) || (req.get('Authorization') && req.get('Authorization').split(' ')[1]);
        if (!token) {
            res.locals.currentUser = null;
            return next();
        }
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = payload;
            res.locals.currentUser = payload;
        } catch (err) {
            res.locals.currentUser = null;
        }
        return next();
    },

    ensureAuth: function (req, res, next) {
        if (req.user) return next();
        const returnTo = req.originalUrl || req.url;
        return res.redirect('/login?returnTo=' + encodeURIComponent(returnTo));
    },

    redirectIfAuthenticated: function (req, res, next) {
        if (req.user) return res.redirect('/');
        next();
    }
};
