import { CreateMurmurDto } from './dto/create-murmur.dto';
import { MurmurService } from './murmur.service';
export declare class MurmurController {
    private readonly murmurService;
    constructor(murmurService: MurmurService);
    createMurmur(createMurmurDto: CreateMurmurDto, req: any): Promise<import("../entities/murmur.entity").Murmur>;
    getMurmurs(page: number, limit: number): Promise<{
        murmurs: import("../entities/murmur.entity").Murmur[];
        total: number;
    }>;
    getMurmurById(id: number): Promise<import("../entities/murmur.entity").Murmur>;
    deleteMurmur(id: number, req: any): Promise<void>;
    likeMurmur(murmurId: number, req: any): Promise<import("../entities/like.entity").Like>;
    unlikeMurmur(murmurId: number, req: any): Promise<void>;
}
