import { Db } from 'mongodb';
export declare function toggleFavorite(db: Db, userId: string, listingId: string): Promise<'added' | 'removed'>;
export declare function listFavoritesIds(db: Db, userId: string): Promise<string[]>;
//# sourceMappingURL=favoriteModel.d.ts.map