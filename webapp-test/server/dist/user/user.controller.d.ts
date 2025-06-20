import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUserById(id: number): Promise<import("../entities/user.entity").User>;
    getMurmursByUserId(userId: number, page: number, limit: number): Promise<{
        murmurs: import("../entities/murmur.entity").Murmur[];
        total: number;
    }>;
}
