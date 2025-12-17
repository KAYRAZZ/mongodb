"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFavorite = toggleFavorite;
exports.listFavoritesIds = listFavoritesIds;
async function toggleFavorite(db, userId, listingId) {
    const col = db.collection('favorites');
    const existing = await col.findOne({ userId, listingId });
    if (existing) {
        await col.deleteOne({ _id: existing._id });
        return 'removed';
    }
    await col.insertOne({ userId, listingId, createdAt: new Date() });
    return 'added';
}
async function listFavoritesIds(db, userId) {
    const col = db.collection('favorites');
    const items = await col.find({ userId }).toArray();
    return items.map((f) => f.listingId);
}
//# sourceMappingURL=favoriteModel.js.map