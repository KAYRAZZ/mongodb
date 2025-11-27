// Simple user model helpers using the app's MongoDB instance
module.exports = {
    findByEmail: async (db, email) => {
        if (!db) throw new Error('Database not initialized');
        if (!email) return null;
        return db.collection('users').findOne({ email: String(email).toLowerCase() });
    },

    // optional helper to create a user (password should be hashed before calling)
    create: async (db, user) => {
        if (!db) throw new Error('Database not initialized');
        const res = await db.collection('users').insertOne(user);
        return res && res.insertedId ? { _id: res.insertedId, ...user } : null;
    }
};
