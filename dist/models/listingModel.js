"use strict";
async function distinctPropertyTypes(db) {
    if (!db)
        return [];
    try {
        const types = await db.collection('listingsAndReviews').distinct('property_type');
        return (types || []).filter(Boolean).sort();
    }
    catch (e) {
        console.warn('distinctPropertyTypes error', e && e.message);
        return [];
    }
}
async function distinctCountries(db) {
    if (!db)
        return [];
    try {
        const countries = await db.collection('listingsAndReviews').distinct('address.country');
        return (countries || []).filter(Boolean).sort();
    }
    catch (e) {
        console.warn('distinctCountries error', e && e.message);
        return [];
    }
}
async function distinctMarkets(db, country) {
    if (!db)
        return [];
    try {
        const col = db.collection('listingsAndReviews');
        let markets = [];
        if (country)
            markets = await col.distinct('address.market', { 'address.country': country });
        else
            markets = await col.distinct('address.market');
        return (markets || []).filter(Boolean).sort();
    }
    catch (e) {
        console.warn('distinctMarkets error', e && e.message);
        return [];
    }
}
async function findListings(db, filter, limit = 50) {
    if (!db)
        return [];
    try {
        const col = db.collection('listingsAndReviews');
        const results = await col.find(filter).limit(limit).toArray();
        return results;
    }
    catch (e) {
        console.warn('findListings error', e && e.message);
        return [];
    }
}
const Listing = { distinctPropertyTypes, distinctCountries, distinctMarkets, findListings };
module.exports = Listing;
//# sourceMappingURL=listingModel.js.map