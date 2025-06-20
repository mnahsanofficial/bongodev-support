import { User } from './user.entity';
export declare class Follow {
    id: number;
    createdAt: Date;
    follower: User;
    follower_id: number;
    following: User;
    following_id: number;
}
