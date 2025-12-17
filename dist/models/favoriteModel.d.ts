import { Db } from 'mongodb';
export type FavoriteDoc = {
    _id?: any;
    userId: string;
    listingId: string;
    createdAt: Date;
};
export declare function toggleFavorite(db: Db, userId: string, listingId: string): Promise<'added' | 'removed'>;
export declare function listFavoritesIds(db: Db, userId: string): Promise<string[]>;
//# sourceMappingURL=favoriteModel.d.ts.map