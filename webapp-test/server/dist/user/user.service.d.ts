import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { Post } from 'src/entities/post.entity';
export declare class UserService {
    private readonly userRepository;
    private readonly murmurRepository;
    private readonly followRepository;
    constructor(userRepository: Repository<User>, murmurRepository: Repository<Post>, followRepository: Repository<Follow>);
    getUserById(id: number): Promise<User | null>;
    getMurmursByUserId(userId: number, page?: number, limit?: number): Promise<{
        murmurs: Post[];
        total: number;
    }>;
    followUser(followerId: number, followingId: number): Promise<Follow>;
    unfollowUser(followerId: number, followingId: number): Promise<void>;
    isFollowing(followerId: number, followingId: number): Promise<{
        isFollowing: boolean;
    }>;
}
