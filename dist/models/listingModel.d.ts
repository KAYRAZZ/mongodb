import { Db } from 'mongodb';
declare function distinctPropertyTypes(db: Db): Promise<string[]>;
declare function distinctCountries(db: Db): Promise<string[]>;
declare function distinctMarkets(db: Db, country?: string): Promise<string[]>;
declare function findListings(db: Db, filter: any, limit?: number): Promise<any[]>;
declare const Listing: {
    distinctPropertyTypes: typeof distinctPropertyTypes;
    distinctCountries: typeof distinctCountries;
    distinctMarkets: typeof distinctMarkets;
    findListings: typeof findListings;
};
export = Listing;
//# sourceMappingURL=listingModel.d.ts.map