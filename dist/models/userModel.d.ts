import { Db } from 'mongodb';
import { IUser } from './types';
declare const User: {
    findByEmail(db: Db, email: string): Promise<IUser | null>;
    create(db: Db, user: IUser): Promise<IUser | null>;
};
export = User;
//# sourceMappingURL=userModel.d.ts.map