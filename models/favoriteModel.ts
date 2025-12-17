import { Db } from 'mongodb';
import { IFavorite } from './types';

export async function toggleFavorite(db: Db, userId: string, listingId: string): Promise<'added' | 'removed'> {
    const col = db.collection<IFavorite>('favorites');
    const existing = await col.findOne({ userId, listingId });
    if (existing) {
        await col.deleteOne({ _id: existing._id });
        return 'removed';
    }
    await col.insertOne({ userId, listingId, createdAt: new Date() });
    return 'added';
}

export async function listFavoritesIds(db: Db, userId: string): Promise<string[]> {
    const col = db.collection<IFavorite>('favorites');
    const items = await col.find({ userId }).toArray();
    return items.map((f) => f.listingId);
}
