import { User } from './user.entity';
import { Like } from './like.entity';
export declare class Murmur {
    id: number;
    text: string;
    userId: number;
    user: User;
    createdAt: Date;
    updatedAt: Date;
    likes: Like[];
}
