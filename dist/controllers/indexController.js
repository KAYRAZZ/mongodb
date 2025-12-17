"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFavori = exports.favori = exports.marketsApi = exports.search = exports.home = void 0;
const mongodb_1 = require("mongodb");
const Listing = require("../models/listingModel");
const Favorites = __importStar(require("../models/favoriteModel"));
function buildTextFilter(q) {
    if (!q)
        return null;
    const regex = new RegExp(q, 'i');
    const textOr = [{ name: regex }, { email: regex }, { title: regex }, { description: regex }];
    if (mongodb_1.ObjectId.isValid(q))
        textOr.push({ _id: new mongodb_1.ObjectId(q) });
    return { $or: textOr };
}
function buildPriceFilter(minPrice, maxPrice) {
    const hasMin = Number.isFinite(minPrice);
    const hasMax = Number.isFinite(maxPrice);
    if (!hasMin && !hasMax)
        return null;
    const priceCond = {};
    if (hasMin)
        priceCond.$gte = minPrice;
    if (hasMax)
        priceCond.$lte = maxPrice;
    return { price: priceCond };
}
function buildBedsFilter(beds) {
    if (!Number.isFinite(beds))
        return null;
    return { beds: { $gte: beds } };
}
function buildPropertyTypeFilter(selectedPropertyType) {
    if (!selectedPropertyType)
        return null;
    return { property_type: selectedPropertyType };
}
function buildCountryFilter(selectedCountry) {
    if (!selectedCountry)
        return null;
    return { 'address.country': selectedCountry };
}
function buildMarketFilter(selectedMarket) {
    if (!selectedMarket)
        return null;
    return { 'address.market': selectedMarket };
}
function combineFilters(parts) {
    const p = parts.filter(Boolean);
    if (p.length === 0)
        return {};
    if (p.length === 1)
        return p[0];
    return { $and: p };
}
const home = async (req, res) => {
    const db = req.app?.locals?.db || undefined;
    const mongoClient = req.app?.locals?.mongoClient;
    const usersDb = mongoClient ? mongoClient.db('users') : db;
    const userId = req.user?.id;
    let propertyTypes = [];
    let countries = [];
    let favoritesIds = [];
    try {
        if (db) {
            propertyTypes = await Listing.distinctPropertyTypes(db);
            countries = await Listing.distinctCountries(db);
            if (userId && usersDb)
                favoritesIds = await Favorites.listFavoritesIds(usersDb, userId);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Could not fetch property types:', msg);
    }
    return res.render('index', {
        query: undefined,
        results: [],
        minPrice: undefined,
        maxPrice: undefined,
        beds: undefined,
        propertyTypes,
        selectedPropertyType: undefined,
        countries,
        selectedCountry: undefined,
        markets: [],
        selectedMarket: undefined,
        favoritesIds
    });
};
exports.home = home;
const search = async (req, res) => {
    const db = req.app?.locals?.db || undefined;
    const mongoClient = req.app?.locals?.mongoClient;
    const usersDb = mongoClient ? mongoClient.db('users') : db;
    const userId = req.user?.id;
    const q = (typeof req.query.q === 'string' ? req.query.q : '').trim();
    const rawMin = req.query.minPrice;
    const rawMax = req.query.maxPrice;
    const minPrice = rawMin !== undefined && rawMin !== '' ? Number(rawMin) : undefined;
    const maxPrice = rawMax !== undefined && rawMax !== '' ? Number(rawMax) : undefined;
    let propertyTypes = [];
    let countries = [];
    let favoritesIds = [];
    try {
        if (db) {
            propertyTypes = await Listing.distinctPropertyTypes(db);
            countries = await Listing.distinctCountries(db);
            if (userId && usersDb)
                favoritesIds = await Favorites.listFavoritesIds(usersDb, userId);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Could not fetch property types or countries:', msg);
    }
    const selectedPropertyType = typeof req.query.property_type === 'string' && req.query.property_type !== '' ? req.query.property_type : undefined;
    const selectedCountry = typeof req.query.country === 'string' && req.query.country !== '' ? req.query.country : undefined;
    let markets = [];
    try {
        if (db) {
            markets = await Listing.distinctMarkets(db, selectedCountry);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Could not fetch markets:', msg);
    }
    const selectedMarket = typeof req.query.market === 'string' && req.query.market !== '' ? req.query.market : undefined;
    const rawBeds = req.query.beds;
    const beds = rawBeds !== undefined && rawBeds !== '' ? Number(rawBeds) : undefined;
    if (!q && minPrice === undefined && maxPrice === undefined && beds === undefined && !selectedPropertyType && !selectedCountry && !selectedMarket) {
        return res.render('index', {
            query: q,
            results: [],
            minPrice: undefined,
            maxPrice: undefined,
            beds: undefined,
            propertyTypes,
            selectedPropertyType: undefined,
            countries,
            selectedCountry: undefined,
            markets,
            selectedMarket: undefined,
            favoritesIds
        });
    }
    const textFilter = buildTextFilter(q);
    const priceFilter = buildPriceFilter(minPrice, maxPrice);
    const bedsFilter = buildBedsFilter(beds);
    const propertyTypeFilter = buildPropertyTypeFilter(selectedPropertyType);
    const countryFilter = buildCountryFilter(selectedCountry);
    const marketFilter = buildMarketFilter(selectedMarket);
    const filter = combineFilters([textFilter, priceFilter, bedsFilter, propertyTypeFilter, countryFilter, marketFilter]);
    const results = db ? await Listing.findListings(db, filter) : [];
    const mapped = results.map((r) => ({
        id: r._id?.toString?.() ?? String(r._id ?? ''),
        name: r.name,
        summary: r.summary,
        review_score: (r.review_scores && r.review_scores.review_scores_rating != null) ? r.review_scores.review_scores_rating : null,
        property_type: r.property_type,
        country: (r.address && r.address.country) || r.country,
        image: (r.images && (r.images.picture_url || (Array.isArray(r.images) && r.images[0] && r.images[0].picture_url))) || r.picture_url || null,
        price: r.price,
        beds: r.beds,
        bedrooms: r.bedrooms,
        minimum_nights: r.minimum_nights,
        maximum_nights: r.maximum_nights,
    }));
    return res.render('index', { query: q, results: mapped, minPrice, maxPrice, beds, propertyTypes, selectedPropertyType, countries, selectedCountry, markets, selectedMarket, favoritesIds });
};
exports.search = search;
const marketsApi = async (req, res) => {
    const db = req.app?.locals?.db || undefined;
    const country = typeof req.query.country === 'string' && req.query.country !== '' ? req.query.country : undefined;
    try {
        if (!db)
            return res.json({ markets: [] });
        const markets = await Listing.distinctMarkets(db, country);
        return res.json({ markets });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Error fetching markets API:', msg);
        return res.status(500).json({ markets: [] });
    }
};
exports.marketsApi = marketsApi;
const favori = async (req, res) => {
    const db = req.app?.locals?.db || undefined;
    const mongoClient = req.app?.locals?.mongoClient;
    const usersDb = mongoClient ? mongoClient.db('users') : db;
    const userId = req.user?.id;
    let favoritesIds = [];
    let results = [];
    if (db && userId && usersDb) {
        favoritesIds = await Favorites.listFavoritesIds(usersDb, userId);
        // Build a union of possible ID representations: ObjectId, number, and string.
        const idVariants = [];
        for (const raw of favoritesIds) {
            if (typeof raw !== 'string')
                continue;
            // Always include the string itself
            idVariants.push(raw);
            // Include numeric representation if it's a clean number string
            if (/^-?\d+$/.test(raw)) {
                const asNum = Number(raw);
                if (Number.isSafeInteger(asNum))
                    idVariants.push(asNum);
            }
            // Include ObjectId if valid
            if (mongodb_1.ObjectId.isValid(raw)) {
                try {
                    idVariants.push(new mongodb_1.ObjectId(raw));
                }
                catch { }
            }
        }
        if (idVariants.length) {
            results = await Listing.findListings(db, { _id: { $in: idVariants } });
        }
    }
    const mapped = results.map((r) => ({
        id: r._id?.toString?.() ?? String(r._id ?? ''),
        name: r.name,
        summary: r.summary,
        review_score: (r.review_scores && r.review_scores.review_scores_rating != null) ? r.review_scores.review_scores_rating : null,
        property_type: r.property_type,
        country: (r.address && r.address.country) || r.country,
        image: (r.images && (r.images.picture_url || (Array.isArray(r.images) && r.images[0] && r.images[0].picture_url))) || r.picture_url || null,
        price: r.price,
        beds: r.beds,
        bedrooms: r.bedrooms,
        minimum_nights: r.minimum_nights,
        maximum_nights: r.maximum_nights,
    }));
    return res.render('favori', { results: mapped });
};
exports.favori = favori;
const toggleFavori = async (req, res) => {
    const db = req.app?.locals?.db || undefined;
    const mongoClient = req.app?.locals?.mongoClient;
    const usersDb = mongoClient ? mongoClient.db('users') : db;
    const userId = req.user?.id;
    const listingId = typeof req.body?.listingId === 'string' ? req.body.listingId : undefined;
    if (!usersDb || !userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    if (!listingId)
        return res.status(400).json({ error: 'listingId required' });
    try {
        const status = await Favorites.toggleFavorite(usersDb, userId, listingId);
        return res.json({ status });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('toggleFavori error', msg);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.toggleFavori = toggleFavori;
//# sourceMappingURL=indexController.js.map