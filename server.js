const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');
const routes = require('./routes/index');
const authRoutes = require('./routes/auth');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middlewares/auth');


const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME_AIRBNB || 'sample_airbnb';
const PORT = process.env.PORT || 3000;

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// parse cookies (for JWT cookie)
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true
}));

// populate req.user / res.locals.currentUser from JWT cookie
app.use(authMiddleware.populateUser);

// security: helmet
app.use(helmet());

// global rate limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
});
app.use(globalLimiter);

let db;

app.use('/', routes);
app.use('/', authRoutes);

MongoClient.connect(MONGO_URL)
    .then(client => {
        db = client.db(DB_NAME);
        app.locals.db = db;
        // expose the raw MongoClient so controllers can select other DBs (eg. 'users')
        app.locals.mongoClient = client;
        app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

