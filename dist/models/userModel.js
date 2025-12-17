"use strict";
const User = {
    async findByEmail(db, email) {
        if (!db)
            throw new Error('Database not initialized');
        if (!email)
            return null;
        return db.collection('users').findOne({ email: String(email).toLowerCase() });
    },
    async create(db, user) {
        if (!db)
            throw new Error('Database not initialized');
        const res = await db.collection('users').insertOne(user);
        return res && res.insertedId ? { _id: res.insertedId, ...user } : null;
    }
};
module.exports = User;
//# sourceMappingURL=userModel.js.map