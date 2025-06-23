import { Repository } from 'typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Like } from '../entities/like.entity';
import { Follow } from '../entities/follow.entity';
import { CreateMurmurDto } from './dto/create-murmur.dto';
export declare class MurmurService {
    private readonly murmurRepository;
    private readonly likeRepository;
    private readonly followRepository;
    constructor(murmurRepository: Repository<Murmur>, likeRepository: Repository<Like>, followRepository: Repository<Follow>);
    createMurmur(createMurmurDto: CreateMurmurDto, userId: number): Promise<Murmur>;
    getMurmurs(page?: number, limit?: number, loggedInUserId?: number | null): Promise<{
        murmurs: any[];
        total: number;
    }>;
    getMurmurById(id: number, loggedInUserId?: number | null): Promise<any | null>;
    deleteMurmur(id: number, userId: number): Promise<void>;
    likeMurmur(userId: number, murmurId: number): Promise<Like>;
    unlikeMurmur(userId: number, murmurId: number): Promise<void>;
    getLikesCountForMurmur(murmurId: number): Promise<number>;
    getTimeline(loggedInUserId: number, page?: number, limit?: number): Promise<{
        murmurs: any[];
        total: number;
    }>;
    getMurmursByUserIdWithLikes(targetUserId: number, page?: number, limit?: number, loggedInUserId?: number | null): Promise<{
        murmurs: any[];
        total: number;
    }>;
}
