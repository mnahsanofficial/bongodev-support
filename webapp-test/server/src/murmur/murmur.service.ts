import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; 
import { Murmur } from '../entities/murmur.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity'; 
import { Follow } from '../entities/follow.entity'; 
import { CreateMurmurDto } from './dto/create-murmur.dto';

@Injectable()
export class MurmurService {
  constructor(
    @InjectRepository(Murmur)
    private readonly murmurRepository: Repository<Murmur>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Follow) // Inject FollowRepository
    private readonly followRepository: Repository<Follow>,
  ) {}

  async createMurmur(
    createMurmurDto: CreateMurmurDto,
    userId: number,
  ): Promise<Murmur> {
    const murmur = this.murmurRepository.create({
      ...createMurmurDto,
      userId,
    });
    return this.murmurRepository.save(murmur);
  }

  // For public murmurs, isLiked is only relevant if loggedInUserId is provided
  async getMurmurs( 
    page: number = 1,
    limit: number = 10,
    loggedInUserId?: number | null, // Optional ID of the user making the request
  ): Promise<{ murmurs: any[]; total: number }> {
    const [murmursData, total] = await this.murmurRepository
      .createQueryBuilder('murmur')
      .leftJoinAndSelect('murmur.user', 'user')
      .loadRelationCountAndMap('murmur.likeCount', 'murmur.likes')
      .orderBy('murmur.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (loggedInUserId) {
      const murmursWithIsLiked = await Promise.all(
        murmursData.map(async (murmur) => {
          const like = await this.likeRepository.findOneBy({
            murmurId: murmur.id,
            userId: loggedInUserId,
          });
          return { ...murmur, isLiked: !!like };
        }),
      );
      return { murmurs: murmursWithIsLiked, total };
    }

    return { murmurs: murmursData, total }; // No isLiked property if no user is logged in
  }

  // For a specific murmur, isLiked is only relevant if loggedInUserId is provided
  async getMurmurById(id: number, loggedInUserId?: number | null): Promise<any | null> {
    const murmur = await this.murmurRepository
      .createQueryBuilder('murmur')
      .where('murmur.id = :id', { id })
      .leftJoinAndSelect('murmur.user', 'user')
      .loadRelationCountAndMap('murmur.likeCount', 'murmur.likes')
      .getOne();

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${id} not found`);
    }
    if (loggedInUserId) {
      const like = await this.likeRepository.findOneBy({
        murmurId: murmur.id,
        userId: loggedInUserId,
      });
      return { ...murmur, isLiked: !!like };
    }
    return murmur; // No isLiked property if no user is logged in
  }

  async deleteMurmur(id: number, userId: number): Promise<void> {
    const murmur = await this.murmurRepository.findOneBy({ id });
    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${id} not found`);
    }
    if (murmur.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this murmur');
    }
    await this.murmurRepository.delete(id);
  }

  async likeMurmur(userId: number, murmurId: number): Promise<Like> {
    const murmur = await this.murmurRepository.findOneBy({ id: murmurId });
    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${murmurId} not found`);
    }

    const existingLike = await this.likeRepository.findOneBy({
      userId,
      murmurId,
    });
    if (existingLike) {
      throw new ConflictException('You have already liked this murmur');
    }

    const like = this.likeRepository.create({ userId, murmurId });
    return this.likeRepository.save(like);
  }

  async unlikeMurmur(userId: number, murmurId: number): Promise<void> {
    const like = await this.likeRepository.findOneBy({ userId, murmurId });
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    await this.likeRepository.delete(like.id);
  }

  async getLikesCountForMurmur(murmurId: number): Promise<number> {
    return this.likeRepository.count({ where: { murmurId } });
  }

  async getTimeline(
    userId: number, // This is the ID of the user whose timeline is being fetched (current logged-in user)
    page: number = 1,
    limit: number = 10,
  ): Promise<{ murmurs: any[]; total: number }> { // Return type changed to any[] for murmurs temporarily
    const follows = await this.followRepository.find({
      where: { follower_id: userId },
      select: ['following_id'],
    });

    if (follows.length === 0) {
      return { murmurs: [], total: 0 };
    }

    const followingIds = follows.map((follow) => follow.following_id);
    // Also include the user's own murmurs in their timeline
    const allUserIdsForTimeline = [...new Set([...followingIds, userId])];


    const [murmursData, total] = await this.murmurRepository
      .createQueryBuilder('murmur')
      .where('murmur.userId IN (:...allUserIdsForTimeline)', { allUserIdsForTimeline })
      .leftJoinAndSelect('murmur.user', 'user')
      .loadRelationCountAndMap('murmur.likeCount', 'murmur.likes')
      .orderBy('murmur.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // For each murmur, check if the current user (userId) has liked it
    const murmursWithIsLiked = await Promise.all(
      murmursData.map(async (murmur) => {
        const like = await this.likeRepository.findOneBy({
          murmurId: murmur.id,
          userId: userId, // Check against the logged-in user
        });
        return { ...murmur, isLiked: !!like };
      }),
    );

    return { murmurs: murmursWithIsLiked, total };
  }

  async getMurmursByUserIdWithLikes(
    targetUserId: number,
    page: number = 1,
    limit: number = 10,
    loggedInUserId?: number | null,
  ): Promise<{ murmurs: any[]; total: number }> {
    const [murmursData, total] = await this.murmurRepository
      .createQueryBuilder('murmur')
      .where('murmur.userId = :targetUserId', { targetUserId })
      .leftJoinAndSelect('murmur.user', 'user')
      .loadRelationCountAndMap('murmur.likeCount', 'murmur.likes')
      .orderBy('murmur.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Augment with isLiked status
    if (loggedInUserId) {
      const murmursWithIsLiked = await Promise.all(
        murmursData.map(async (murmur) => {
          try {
            const like = await this.likeRepository.findOneBy({
              murmurId: murmur.id,
              userId: loggedInUserId as number, // Cast, as it's inside if (loggedInUserId)
            });
            return { ...murmur, isLiked: !!like };
          } catch (error) {
            console.error(`Error checking like status for murmur ${murmur.id} and user ${loggedInUserId}:`, error);
            return { ...murmur, isLiked: false }; // Default to false on error for this specific murmur
          }
        }),
      );
      return { murmurs: murmursWithIsLiked, total };
    }
    // If no loggedInUserId, return murmurs with likeCount but without isLiked
    return { murmurs: murmursData.map(m => ({...m, isLiked: false })), total };
  }
}
