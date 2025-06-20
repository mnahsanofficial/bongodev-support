import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Murmur } from '../entities/murmur.entity';
export declare class UserService {
    private readonly userRepository;
    private readonly murmurRepository;
    constructor(userRepository: Repository<User>, murmurRepository: Repository<Murmur>);
    getUserById(id: number): Promise<User | null>;
    getMurmursByUserId(userId: number, page?: number, limit?: number): Promise<{
        murmurs: Murmur[];
        total: number;
    }>;
}
