import { Db } from 'mongodb';
import { IListingDoc } from './types';

async function distinctPropertyTypes(db: Db): Promise<string[]> {
    if (!db) return [] as string[];
    try {
        const types = await db.collection('listingsAndReviews').distinct('property_type');
        return (types || []).filter(Boolean).sort();
    } catch (e: any) {
        console.warn('distinctPropertyTypes error', e && e.message);
        return [];
    }
}

async function distinctCountries(db: Db): Promise<string[]> {
    if (!db) return [] as string[];
    try {
        const countries = await db.collection('listingsAndReviews').distinct('address.country');
        return (countries || []).filter(Boolean).sort();
    } catch (e: any) {
        console.warn('distinctCountries error', e && e.message);
        return [];
    }
}

async function distinctMarkets(db: Db, country?: string): Promise<string[]> {
    if (!db) return [] as string[];
    try {
        const col = db.collection('listingsAndReviews');
        let markets: any[] = [];
        if (country) markets = await col.distinct('address.market', { 'address.country': country });
        else markets = await col.distinct('address.market');
        return (markets || []).filter(Boolean).sort();
    } catch (e: any) {
        console.warn('distinctMarkets error', e && e.message);
        return [];
    }
}

async function findListings(db: Db, filter: any, limit: number = 50): Promise<IListingDoc[]> {
    if (!db) return [];
    try {
        const col = db.collection('listingsAndReviews');
        const results = await col.find(filter).limit(limit).toArray();
        return results as IListingDoc[];
    } catch (e: any) {
        console.warn('findListings error', e && e.message);
        return [];
    }
}

const Listing = { distinctPropertyTypes, distinctCountries, distinctMarkets, findListings };

export = Listing;
