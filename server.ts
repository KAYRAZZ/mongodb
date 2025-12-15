import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import { MongoClient } from 'mongodb';
import routes from './routes/index';
import authRoutes from './routes/auth';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authMiddleware from './middlewares/auth';
import morgan from 'morgan';

const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME_AIRBNB ?? 'sample_airbnb';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.set('view engine', 'ejs');
// Point to the source views folder even after compile (dist/server.js -> ../views)
app.set('views', path.join(__dirname, '../views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan('dev'));
app.use(cookieParser());

const corsOptions: CorsOptions = { credentials: true };
if (process.env.CORS_ORIGIN) {
    corsOptions.origin = process.env.CORS_ORIGIN;
}
app.use(cors(corsOptions));

app.use(authMiddleware.populateUser);

app.use(helmet({ crossOriginEmbedderPolicy: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
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

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});
app.use(globalLimiter);

app.use('/', routes);
app.use('/', authRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
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
        const client = await MongoClient.connect(MONGO_URL);
        const db = client.db(DB_NAME);

        app.locals.db = db;
        app.locals.mongoClient = client;

        app.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    }
})();