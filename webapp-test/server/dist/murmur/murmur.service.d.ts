import { Repository } from 'typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Like } from '../entities/like.entity';
import { CreateMurmurDto } from './dto/create-murmur.dto';
export declare class MurmurService {
    private readonly murmurRepository;
    private readonly likeRepository;
    constructor(murmurRepository: Repository<Murmur>, likeRepository: Repository<Like>);
    createMurmur(createMurmurDto: CreateMurmurDto, userId: number): Promise<Murmur>;
    getMurmurs(page?: number, limit?: number): Promise<{
        murmurs: Murmur[];
        total: number;
    }>;
    getMurmurById(id: number): Promise<Murmur | null>;
    deleteMurmur(id: number, userId: number): Promise<void>;
    likeMurmur(userId: number, murmurId: number): Promise<Like>;
    unlikeMurmur(userId: number, murmurId: number): Promise<void>;
    getLikesCountForMurmur(murmurId: number): Promise<number>;
}
