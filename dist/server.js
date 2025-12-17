"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const index_1 = __importDefault(require("./routes/index"));
const auth_1 = __importDefault(require("./routes/auth"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_2 = __importDefault(require("./middlewares/auth"));
const morgan_1 = __importDefault(require("morgan"));
const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME_AIRBNB ?? 'sample_airbnb';
const PORT = Number(process.env.PORT) || 3000;
const app = (0, express_1.default)();
app.set('view engine', 'ejs');
// Point to the source views folder even after compile (dist/server.js -> ../views)
app.set('views', path_1.default.join(__dirname, '../views'));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use((0, cookie_parser_1.default)());
const corsOptions = { credentials: true };
if (process.env.CORS_ORIGIN) {
    corsOptions.origin = process.env.CORS_ORIGIN;
}
app.use((0, cors_1.default)(corsOptions));
app.use(auth_2.default.populateUser);
app.use((0, helmet_1.default)({ crossOriginEmbedderPolicy: false }));
app.use((req, res, next) => {
    const directives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "img-src 'self' https://a0.muscache.com https: data: blob:",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' https:",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'"
    ];
    res.setHeader('Content-Security-Policy', directives.join('; '));
    next();
});
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});
app.use(globalLimiter);
app.use('/', index_1.default);
app.use('/', auth_1.default);
app.use((req, res, next) => {
    const directives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://a0.muscache.com/im/pictures",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' https:",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'"
    ];
    res.setHeader('Content-Security-Policy', directives.join('; '));
    next();
});
(async () => {
    try {
        const client = await mongodb_1.MongoClient.connect(MONGO_URL);
        const db = client.db(DB_NAME);
        app.locals.db = db;
        app.locals.mongoClient = client;
        app.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=server.js.map