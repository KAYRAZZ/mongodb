"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = void 0;
const buildValidator = (schema, source = 'body') => {
    return (req, res, next) => {
        const target = req[source];
        const { error, value } = schema.validate(target, { abortEarly: false, stripUnknown: true });
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
        req[source] = value;
        return next();
    };
};
const validateBody = (schema) => buildValidator(schema, 'body');
exports.validateBody = validateBody;
const validateParams = (schema) => buildValidator(schema, 'params');
exports.validateParams = validateParams;
const validateQuery = (schema) => buildValidator(schema, 'query');
exports.validateQuery = validateQuery;
exports.default = { validateBody: exports.validateBody, validateParams: exports.validateParams, validateQuery: exports.validateQuery };
//# sourceMappingURL=validation.js.map