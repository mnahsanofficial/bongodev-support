"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MurmurService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const murmur_entity_1 = require("../entities/murmur.entity");
const like_entity_1 = require("../entities/like.entity");
let MurmurService = class MurmurService {
    constructor(murmurRepository, likeRepository) {
        this.murmurRepository = murmurRepository;
        this.likeRepository = likeRepository;
    }
    async createMurmur(createMurmurDto, userId) {
        const murmur = this.murmurRepository.create({
            ...createMurmurDto,
            userId,
        });
        return this.murmurRepository.save(murmur);
    }
    async getMurmurs(page = 1, limit = 10) {
        const [murmurs, total] = await this.murmurRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { murmurs, total };
    }
    async getMurmurById(id) {
        const murmur = await this.murmurRepository.findOneBy({ id });
        if (!murmur) {
            throw new common_1.NotFoundException(`Murmur with ID ${id} not found`);
        }
        return murmur;
    }
    async deleteMurmur(id, userId) {
        const murmur = await this.murmurRepository.findOneBy({ id });
        if (!murmur) {
            throw new common_1.NotFoundException(`Murmur with ID ${id} not found`);
        }
        if (murmur.userId !== userId) {
            throw new common_1.ForbiddenException('You are not authorized to delete this murmur');
        }
        await this.murmurRepository.delete(id);
    }
    async likeMurmur(userId, murmurId) {
        const murmur = await this.murmurRepository.findOneBy({ id: murmurId });
        if (!murmur) {
            throw new common_1.NotFoundException(`Murmur with ID ${murmurId} not found`);
        }
        const existingLike = await this.likeRepository.findOneBy({
            userId,
            murmurId,
        });
        if (existingLike) {
            throw new common_1.ConflictException('You have already liked this murmur');
        }
        const like = this.likeRepository.create({ userId, murmurId });
        return this.likeRepository.save(like);
    }
    async unlikeMurmur(userId, murmurId) {
        const like = await this.likeRepository.findOneBy({ userId, murmurId });
        if (!like) {
            throw new common_1.NotFoundException('Like not found');
        }
        await this.likeRepository.delete(like.id);
    }
    async getLikesCountForMurmur(murmurId) {
        return this.likeRepository.count({ where: { murmurId } });
    }
};
exports.MurmurService = MurmurService;
exports.MurmurService = MurmurService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(murmur_entity_1.Murmur)),
    __param(1, (0, typeorm_1.InjectRepository)(like_entity_1.Like)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MurmurService);
//# sourceMappingURL=murmur.service.js.map