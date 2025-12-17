import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController';
import { redirectIfAuthenticated } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';
import Joi from 'joi';

const router = express.Router();

router.get('/login', redirectIfAuthenticated, authController.showLogin);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Trop de tentatives de connexion, réessayez plus tard.'
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

router.post(
    '/login',
    redirectIfAuthenticated,
    validateBody(loginSchema),
    loginLimiter,
    authController.login
);

router.get('/logout', authController.logout);

router.get('/register', redirectIfAuthenticated, authController.showRegister);

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Trop de tentatives d\'inscription, réessayez plus tard.'
});

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password'))
});

router.post(
    '/register',
    redirectIfAuthenticated,
    validateBody(registerSchema),
    registerLimiter,
    authController.register
);

export default router;
