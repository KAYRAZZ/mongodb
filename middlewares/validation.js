function buildValidator(schema, source = 'body') {
    return (req, res, next) => {
        const target = req[source];
        const { error, value } = schema.validate(target, { abortEarly: false, stripUnknown: true });
        if (error) {
            const errors = error.details.map(d => ({ path: d.path.join('.'), message: d.message }));

            // If the client expects HTML (browser) or is a form POST and this is the login route,
            // render the login page with the error and return 200 so browsers show the form again.
            const isLoginRoute = (req.path === '/login' || (req.originalUrl && req.originalUrl.startsWith('/login')));
            const isFormPost = req.headers && typeof req.headers['content-type'] === 'string' && req.headers['content-type'].includes('application/x-www-form-urlencoded');
            if (isLoginRoute && ((req.accepts && req.accepts('html')) || isFormPost)) {
                const msg = errors.map(e => e.message).join(', ');
                return res.status(200).render('login', {
                    error: msg,
                    email: (req.body && req.body.email) ? req.body.email : '',
                    remember: !!(req.body && req.body.remember)
                });
            }

            // Default: return JSON errors (API / AJAX clients)
            return res.status(400).json({ errors });
        }
        // replace the source with the sanitized value
        req[source] = value;
        next();
    };
}

function validateBody(schema) { return buildValidator(schema, 'body'); }
function validateParams(schema) { return buildValidator(schema, 'params'); }
function validateQuery(schema) { return buildValidator(schema, 'query'); }

module.exports = { validateBody, validateParams, validateQuery };
