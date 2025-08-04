import { UserService } from './user.service';
import { PostService } from 'src/post/post.service';
export declare class UserController {
    private readonly userService;
    private readonly murmurService;
    constructor(userService: UserService, murmurService: PostService);
    getUserById(id: number): Promise<import("../entities/user.entity").User>;
    getMurmursByUserId(targetUserId: number, page: number, limit: number, req: any): Promise<{
        posts: any[];
        total: number;
    }>;
    followUser(followingId: number, req: any): Promise<import("../entities/follow.entity").Follow>;
    unfollowUser(followingId: number, req: any): Promise<void>;
    isFollowing(followingId: number, req: any): Promise<{
        isFollowing: boolean;
    }>;
}
