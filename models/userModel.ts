import { Db } from 'mongodb';

const User = {
    async findByEmail(db: Db, email: string): Promise<any | null> {
        if (!db) throw new Error('Database not initialized');
        if (!email) return null;
        return db.collection('users').findOne({ email: String(email).toLowerCase() });
    },

    async create(db: Db, user: any): Promise<any | null> {
        if (!db) throw new Error('Database not initialized');
        const res = await db.collection('users').insertOne(user);
        return res && (res as any).insertedId ? { _id: (res as any).insertedId, ...user } : null;
    }
};

export = User;
