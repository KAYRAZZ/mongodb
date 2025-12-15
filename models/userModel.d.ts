import { Db } from 'mongodb';

declare const User: {
    findByEmail(db: Db, email: string): Promise<any | null>;
    create(db: Db, user: any): Promise<any | null>;
};

export = User;