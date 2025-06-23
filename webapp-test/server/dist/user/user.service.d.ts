import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Murmur } from '../entities/murmur.entity';
import { Follow } from '../entities/follow.entity';
export declare class UserService {
    private readonly userRepository;
    private readonly murmurRepository;
    private readonly followRepository;
    constructor(userRepository: Repository<User>, murmurRepository: Repository<Murmur>, followRepository: Repository<Follow>);
    getUserById(id: number): Promise<User | null>;
    getMurmursByUserId(userId: number, page?: number, limit?: number): Promise<{
        murmurs: Murmur[];
        total: number;
    }>;
    followUser(followerId: number, followingId: number): Promise<Follow>;
    unfollowUser(followerId: number, followingId: number): Promise<void>;
    isFollowing(followerId: number, followingId: number): Promise<{
        isFollowing: boolean;
    }>;
}
