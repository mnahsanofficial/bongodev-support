import { Follow } from './follow.entity';
export declare class User {
    id: number;
    name: string;
    password: string;
    followCount: number;
    followedCount: number;
    createdAt: Date;
    updatedAt: Date;
    followers: Follow[];
    following: Follow[];
}
