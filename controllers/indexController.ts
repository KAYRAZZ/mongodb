import { Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import Listing = require('../models/listingModel');
import * as Favorites from '../models/favoriteModel';

type Maybe<T> = T | null | undefined;

function buildTextFilter(q?: string) {
    if (!q) return null;
    const regex = new RegExp(q, 'i');
    const textOr: any[] = [{ name: regex }, { email: regex }, { title: regex }, { description: regex }];
    if (ObjectId.isValid(q)) textOr.push({ _id: new ObjectId(q) });
    return { $or: textOr } as any;
}

function buildPriceFilter(minPrice?: number, maxPrice?: number) {
    const hasMin = Number.isFinite(minPrice as number);
    const hasMax = Number.isFinite(maxPrice as number);
    if (!hasMin && !hasMax) return null;
    const priceCond: any = {};
    if (hasMin) priceCond.$gte = minPrice;
    if (hasMax) priceCond.$lte = maxPrice;
    return { price: priceCond } as any;
}

function buildBedsFilter(beds?: number) {
    if (!Number.isFinite(beds as number)) return null;
    return { beds: { $gte: beds } } as any;
}

function buildPropertyTypeFilter(selectedPropertyType?: string) {
    if (!selectedPropertyType) return null;
    return { property_type: selectedPropertyType } as any;
}

function buildCountryFilter(selectedCountry?: string) {
    if (!selectedCountry) return null;
    return { 'address.country': selectedCountry } as any;
}

function buildMarketFilter(selectedMarket?: string) {
    if (!selectedMarket) return null;
    return { 'address.market': selectedMarket } as any;
}

function combineFilters(parts: Array<Maybe<any>>) {
    const p = parts.filter(Boolean) as any[];
    if (p.length === 0) return {} as any;
    if (p.length === 1) return p[0];
    return { $and: p } as any;
}

export const home = async (req: Request, res: Response) => {
    const db: Db | undefined = (req.app?.locals?.db as Db) || undefined;
    const mongoClient = (req.app?.locals as any)?.mongoClient;
    const usersDb: Db | undefined = mongoClient ? mongoClient.db('users') : db;
    const userId = (req as any).user?.id as string | undefined;
    let propertyTypes: string[] = [];
    let countries: string[] = [];
    let favoritesIds: string[] = [];
    try {
        if (db) {
            propertyTypes = await Listing.distinctPropertyTypes(db);
            countries = await Listing.distinctCountries(db);
            if (userId && usersDb) favoritesIds = await Favorites.listFavoritesIds(usersDb, userId);
        }
    } catch (err: unknown) {
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

export const search = async (req: Request, res: Response) => {
    const db: Db | undefined = (req.app?.locals?.db as Db) || undefined;
    const mongoClient = (req.app?.locals as any)?.mongoClient;
    const usersDb: Db | undefined = mongoClient ? mongoClient.db('users') : db;
    const userId = (req as any).user?.id as string | undefined;
    const q = (typeof req.query.q === 'string' ? req.query.q : '').trim();
    const rawMin = req.query.minPrice as string | undefined;
    const rawMax = req.query.maxPrice as string | undefined;
    const minPrice = rawMin !== undefined && rawMin !== '' ? Number(rawMin) : undefined;
    const maxPrice = rawMax !== undefined && rawMax !== '' ? Number(rawMax) : undefined;

    let propertyTypes: string[] = [];
    let countries: string[] = [];
    let favoritesIds: string[] = [];
    try {
        if (db) {
            propertyTypes = await Listing.distinctPropertyTypes(db);
            countries = await Listing.distinctCountries(db);
            if (userId && usersDb) favoritesIds = await Favorites.listFavoritesIds(usersDb, userId);
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Could not fetch property types or countries:', msg);
    }

    const selectedPropertyType = typeof req.query.property_type === 'string' && req.query.property_type !== '' ? req.query.property_type : undefined;
    const selectedCountry = typeof req.query.country === 'string' && req.query.country !== '' ? req.query.country : undefined;

    let markets: string[] = [];
    try {
        if (db) {
            markets = await Listing.distinctMarkets(db, selectedCountry);
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Could not fetch markets:', msg);
    }

    const selectedMarket = typeof req.query.market === 'string' && req.query.market !== '' ? req.query.market : undefined;
    const rawBeds = req.query.beds as string | undefined;
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

    const results: any[] = db ? await Listing.findListings(db, filter) : [];
    const mapped = results.map((r: any) => ({
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

export const marketsApi = async (req: Request, res: Response) => {
    const db: Db | undefined = (req.app?.locals?.db as Db) || undefined;
    const country = typeof req.query.country === 'string' && req.query.country !== '' ? req.query.country : undefined;
    try {
        if (!db) return res.json({ markets: [] });
        const markets = await Listing.distinctMarkets(db, country);
        return res.json({ markets });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Error fetching markets API:', msg);
        return res.status(500).json({ markets: [] });
    }
};

export const favori = async (req: Request, res: Response) => {
    const db: Db | undefined = (req.app?.locals?.db as Db) || undefined;
    const mongoClient = (req.app?.locals as any)?.mongoClient;
    const usersDb: Db | undefined = mongoClient ? mongoClient.db('users') : db;
    const userId = (req as any).user?.id as string | undefined;
    let favoritesIds: string[] = [];
    let results: any[] = [];

    if (db && userId && usersDb) {
        favoritesIds = await Favorites.listFavoritesIds(usersDb, userId);

        // Build a union of possible ID representations: ObjectId, number, and string.
        const idVariants: any[] = [];
        for (const raw of favoritesIds) {
            if (typeof raw !== 'string') continue;
            // Always include the string itself
            idVariants.push(raw);
            // Include numeric representation if it's a clean number string
            if (/^-?\d+$/.test(raw)) {
                const asNum = Number(raw);
                if (Number.isSafeInteger(asNum)) idVariants.push(asNum);
            }
            // Include ObjectId if valid
            if (ObjectId.isValid(raw)) {
                try { idVariants.push(new ObjectId(raw)); } catch { }
            }
        }

        if (idVariants.length) {
            results = await Listing.findListings(db, { _id: { $in: idVariants } });
        }
    }
    const mapped = results.map((r: any) => ({
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

export const toggleFavori = async (req: Request, res: Response) => {
    const db: Db | undefined = (req.app?.locals?.db as Db) || undefined;
    const mongoClient = (req.app?.locals as any)?.mongoClient;
    const usersDb: Db | undefined = mongoClient ? mongoClient.db('users') : db;
    const userId = (req as any).user?.id as string | undefined;
    const listingId = typeof req.body?.listingId === 'string' ? req.body.listingId : undefined;

    if (!usersDb || !userId) return res.status(401).json({ error: 'Unauthenticated' });
    if (!listingId) return res.status(400).json({ error: 'listingId required' });

    try {
        const status = await Favorites.toggleFavorite(usersDb, userId, listingId);
        return res.json({ status });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('toggleFavori error', msg);
        return res.status(500).json({ error: 'Server error' });
    }
};
