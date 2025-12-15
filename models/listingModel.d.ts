import { Db } from 'mongodb';

declare const Listing: {
    distinctPropertyTypes(db: Db): Promise<string[]>;
    distinctCountries(db: Db): Promise<string[]>;
    distinctMarkets(db: Db, country?: string): Promise<string[]>;
    findListings(db: Db, filter: any, limit?: number): Promise<any[]>;
};

export = Listing;