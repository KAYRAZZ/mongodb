const express = require('express');
const { ObjectId } = require('mongodb');
const { ensureAuth } = require('../middlewares/auth');

// Helper functions
function buildTextFilter(q) {
    if (!q) return null;
    const regex = new RegExp(q, 'i');
    const textOr = [{ name: regex }, { email: regex }, { title: regex }, { description: regex }];
    if (ObjectId.isValid(q)) textOr.push({ _id: ObjectId(q) });
    return { $or: textOr };
}

function buildPriceFilter(minPrice, maxPrice) {
    if (!Number.isFinite(minPrice) && !Number.isFinite(maxPrice)) return null;
    const priceCond = {};
    if (Number.isFinite(minPrice)) priceCond.$gte = minPrice;
    if (Number.isFinite(maxPrice)) priceCond.$lte = maxPrice;
    return { price: priceCond };
}

function buildBedsFilter(beds) {
    if (!Number.isFinite(beds)) return null;
    return { beds: { $gte: beds } };
}

function buildPropertyTypeFilter(selectedPropertyType) {
    if (!selectedPropertyType) return null;
    return { property_type: selectedPropertyType };
}

function buildCountryFilter(selectedCountry) {
    if (!selectedCountry) return null;
    return { 'address.country': selectedCountry };
}

function buildMarketFilter(selectedMarket) {
    if (!selectedMarket) return null;
    return { 'address.market': selectedMarket };
}

function combineFilters(parts) {
    const p = parts.filter(Boolean);
    if (p.length === 0) return {};
    if (p.length === 1) return p[0];
    return { $and: p };
}

const router = express.Router();


// home
router.get('/', ensureAuth, async (req, res) => {
    const db = req.app && req.app.locals && req.app.locals.db;
    let propertyTypes = [];
    let countries = [];
    let markets = [];
    try {
        if (db) {
            propertyTypes = await db.collection('listingsAndReviews').distinct('property_type');
            propertyTypes = propertyTypes.filter(Boolean).sort();
            countries = await db.collection('listingsAndReviews').distinct('address.country');
            countries = countries.filter(Boolean).sort();
        }
    } catch (err) {
        console.warn('Could not fetch property types:', err && err.message);
    }
    res.render('index', { query: undefined, results: [], minPrice: undefined, maxPrice: undefined, beds: undefined, propertyTypes, selectedPropertyType: undefined, countries, selectedCountry: undefined, markets, selectedMarket: undefined });
});

// search
router.get('/search', ensureAuth, async (req, res) => {
    const db = req.app && req.app.locals && req.app.locals.db;
    const q = (req.query.q || '').trim();
    const rawMin = req.query.minPrice;
    const rawMax = req.query.maxPrice;
    const minPrice = rawMin !== undefined && rawMin !== '' ? Number(rawMin) : undefined;
    const maxPrice = rawMax !== undefined && rawMax !== '' ? Number(rawMax) : undefined;

    let propertyTypes = [];
    let countries = [];
    try {
        if (db) {
            propertyTypes = await db.collection('listingsAndReviews').distinct('property_type');
            propertyTypes = propertyTypes.filter(Boolean).sort();
            countries = await db.collection('listingsAndReviews').distinct('address.country');
            countries = countries.filter(Boolean).sort();
        }
    } catch (err) {
        console.warn('Could not fetch property types or countries:', err && err.message);
    }

    const selectedPropertyType = req.query.property_type && req.query.property_type !== '' ? req.query.property_type : undefined;
    const selectedCountry = req.query.country && req.query.country !== '' ? req.query.country : undefined;

    let markets = [];
    try {
        if (db) {
            if (selectedCountry) {
                markets = await db.collection('listingsAndReviews').distinct('address.market', { 'address.country': selectedCountry });
            } else {
                markets = await db.collection('listingsAndReviews').distinct('address.market');
            }
            markets = markets.filter(Boolean).sort();
        }
    } catch (err) {
        console.warn('Could not fetch markets:', err && err.message);
    }

    const selectedMarket = req.query.market && req.query.market !== '' ? req.query.market : undefined;
    const rawBeds = req.query.beds;
    const beds = rawBeds !== undefined && rawBeds !== '' ? Number(rawBeds) : undefined;

    if (!q && minPrice === undefined && maxPrice === undefined && beds === undefined && !selectedPropertyType && !selectedCountry && !selectedMarket) {
        return res.render('index', { query: q, results: [], minPrice: undefined, maxPrice: undefined, beds: undefined, propertyTypes, selectedPropertyType: undefined, countries, selectedCountry: undefined, markets, selectedMarket: undefined });
    }

    const col = db ? db.collection('listingsAndReviews') : null;

    const textFilter = buildTextFilter(q);
    const priceFilter = buildPriceFilter(minPrice, maxPrice);
    const bedsFilter = buildBedsFilter(beds);
    const propertyTypeFilter = buildPropertyTypeFilter(selectedPropertyType);
    const countryFilter = buildCountryFilter(selectedCountry);
    const marketFilter = buildMarketFilter(selectedMarket);

    const filter = combineFilters([textFilter, priceFilter, bedsFilter, propertyTypeFilter, countryFilter, marketFilter]);

    const results = col ? await col.find(filter).limit(50).toArray() : [];
    const mapped = results.map(r => ({
        id: r._id,
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
    res.render('index', { query: q, results: mapped, minPrice: minPrice, maxPrice: maxPrice, beds: beds, propertyTypes, selectedPropertyType, countries, selectedCountry, markets, selectedMarket });
});

// API: markets
router.get('/markets', async (req, res) => {
    const db = req.app && req.app.locals && req.app.locals.db;
    const country = req.query.country && req.query.country !== '' ? req.query.country : undefined;
    try {
        if (!db) return res.json({ markets: [] });
        const col = db.collection('listingsAndReviews');
        let markets = [];
        if (country) {
            markets = await col.distinct('address.market', { 'address.country': country });
        } else {
            markets = await col.distinct('address.market');
        }
        markets = markets.filter(Boolean).sort();
        return res.json({ markets });
    } catch (err) {
        console.warn('Error fetching markets API:', err && err.message);
        return res.status(500).json({ markets: [] });
    }
});

module.exports = router;
