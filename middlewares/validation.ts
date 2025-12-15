import { Request, Response, NextFunction } from 'express';
import { Schema, ValidationResult } from 'joi';

type RequestSource = 'body' | 'params' | 'query';

const buildValidator = (schema: Schema, source: RequestSource = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const target = (req as any)[source];
        const { error, value }: ValidationResult = schema.validate(target, { abortEarly: false, stripUnknown: true });

        if (error) {
            const errors = error.details.map(d => ({ path: d.path.join('.'), message: d.message }));

            const isLoginRoute = req.path === '/login' || (req.originalUrl && req.originalUrl.startsWith('/login'));
            const isFormPost = typeof req.headers['content-type'] === 'string' && req.headers['content-type'].includes('application/x-www-form-urlencoded');
            if (isLoginRoute && (req.accepts?.('html') || isFormPost)) {
                const msg = errors.map(e => e.message).join(', ');
                return res.status(200).render('login', {
                    error: msg,
                    email: typeof req.body?.email === 'string' ? req.body.email : '',
                    remember: !!req.body?.remember
                });
            }

            return res.status(400).json({ errors });
        }

        (req as any)[source] = value;
        return next();
    };
};

export const validateBody = (schema: Schema) => buildValidator(schema, 'body');
export const validateParams = (schema: Schema) => buildValidator(schema, 'params');
export const validateQuery = (schema: Schema) => buildValidator(schema, 'query');

export default { validateBody, validateParams, validateQuery };