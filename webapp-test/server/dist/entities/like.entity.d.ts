import { User } from './user.entity';
import { Murmur } from './murmur.entity';
export declare class Like {
    id: number;
    userId: number;
    murmurId: number;
    createdAt: Date;
    user: User;
    murmur: Murmur;
}
