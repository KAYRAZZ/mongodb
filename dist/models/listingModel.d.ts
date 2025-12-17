import { Db } from 'mongodb';
import { IListingDoc } from './types';
declare function distinctPropertyTypes(db: Db): Promise<string[]>;
declare function distinctCountries(db: Db): Promise<string[]>;
declare function distinctMarkets(db: Db, country?: string): Promise<string[]>;
declare function findListings(db: Db, filter: any, limit?: number): Promise<IListingDoc[]>;
declare const Listing: {
    distinctPropertyTypes: typeof distinctPropertyTypes;
    distinctCountries: typeof distinctCountries;
    distinctMarkets: typeof distinctMarkets;
    findListings: typeof findListings;
};
export = Listing;
//# sourceMappingURL=listingModel.d.ts.map