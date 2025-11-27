const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');
const Joi = require('joi');


const router = express.Router();

// auth routes
router.get('/login', redirectIfAuthenticated, authController.showLogin);

// stricter limiter for login endpoint to help prevent brute-force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Trop de tentatives de connexion, réessayez plus tard.'
});
// validate login body before calling controller
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});
router.post('/login', redirectIfAuthenticated, validateBody(loginSchema), loginLimiter, authController.login);
router.get('/logout', authController.logout);

module.exports = router;
