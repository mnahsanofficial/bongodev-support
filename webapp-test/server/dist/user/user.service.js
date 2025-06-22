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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const murmur_entity_1 = require("../entities/murmur.entity");
const follow_entity_1 = require("../entities/follow.entity");
let UserService = class UserService {
    constructor(userRepository, murmurRepository, followRepository) {
        this.userRepository = userRepository;
        this.murmurRepository = murmurRepository;
        this.followRepository = followRepository;
    }
    async getUserById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'name', 'followCount', 'followedCount', 'createdAt', 'updatedAt'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async getMurmursByUserId(userId, page = 1, limit = 10) {
        const [murmurs, total] = await this.murmurRepository.findAndCount({
            where: { userId },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { murmurs, total };
    }
    async followUser(followerId, followingId) {
        if (followerId === followingId) {
            throw new common_1.BadRequestException('You cannot follow yourself.');
        }
        const userToFollow = await this.userRepository.findOneBy({ id: followingId });
        if (!userToFollow) {
            throw new common_1.NotFoundException(`User with ID ${followingId} not found.`);
        }
        const existingFollow = await this.followRepository.findOneBy({
            follower_id: followerId,
            following_id: followingId,
        });
        if (existingFollow) {
            throw new common_1.ConflictException('You are already following this user.');
        }
        await this.userRepository.increment({ id: followingId }, 'followCount', 1);
        await this.userRepository.increment({ id: followerId }, 'followedCount', 1);
        const follow = this.followRepository.create({
            follower_id: followerId,
            following_id: followingId,
        });
        return this.followRepository.save(follow);
    }
    async unfollowUser(followerId, followingId) {
        const userToUnfollow = await this.userRepository.findOneBy({ id: followingId });
        if (!userToUnfollow) {
            throw new common_1.NotFoundException(`User with ID ${followingId} not found.`);
        }
        const result = await this.followRepository.delete({
            follower_id: followerId,
            following_id: followingId,
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException('You are not following this user.');
        }
        await this.userRepository.decrement({ id: followingId }, 'followCount', 1);
        await this.userRepository.decrement({ id: followerId }, 'followedCount', 1);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(murmur_entity_1.Murmur)),
    __param(2, (0, typeorm_1.InjectRepository)(follow_entity_1.Follow)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map