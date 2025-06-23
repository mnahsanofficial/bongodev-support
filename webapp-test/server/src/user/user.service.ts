import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Murmur } from '../entities/murmur.entity';
import { Follow } from '../entities/follow.entity'; // Import Follow

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Murmur)
    private readonly murmurRepository: Repository<Murmur>,
    @InjectRepository(Follow) // Inject FollowRepository
    private readonly followRepository: Repository<Follow>,
  ) {}

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'followCount', 'followedCount', 'createdAt', 'updatedAt'], // Explicitly excluding password
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getMurmursByUserId(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ murmurs: Murmur[]; total: number }> {
    const [murmurs, total] = await this.murmurRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { murmurs, total };
  }

  async followUser(followerId: number, followingId: number): Promise<Follow> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself.');
    }

    const userToFollow = await this.userRepository.findOneBy({ id: followingId });
    if (!userToFollow) {
      throw new NotFoundException(`User with ID ${followingId} not found.`);
    }

    const existingFollow = await this.followRepository.findOneBy({
      follower_id: followerId,
      following_id: followingId,
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this user.');
    }

    // Increment followCount for the user being followed
    await this.userRepository.increment({ id: followingId }, 'followCount', 1);
    // Increment followedCount for the follower
    await this.userRepository.increment({ id: followerId }, 'followedCount', 1);

    const follow = this.followRepository.create({
      follower_id: followerId,
      following_id: followingId,
    });
    return this.followRepository.save(follow);
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const userToUnfollow = await this.userRepository.findOneBy({ id: followingId });
    if (!userToUnfollow) {
      throw new NotFoundException(`User with ID ${followingId} not found.`);
    }

    const result = await this.followRepository.delete({
      follower_id: followerId,
      following_id: followingId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('You are not following this user.');
    }

    // Decrement followCount for the user being unfollowed
    await this.userRepository.decrement({ id: followingId }, 'followCount', 1);
    // Decrement followedCount for the follower
    await this.userRepository.decrement({ id: followerId }, 'followedCount', 1);
  }

  async isFollowing(
    followerId: number,
    followingId: number,
  ): Promise<{ isFollowing: boolean }> {
    if (followerId === followingId) {
      // Technically, a user doesn't "follow" themselves in a way that's queryable here.
      // Or, you could throw a BadRequestException if this scenario isn't expected.
      return { isFollowing: false };
    }
    const follow = await this.followRepository.findOneBy({
      follower_id: followerId,
      following_id: followingId,
    });
    return { isFollowing: !!follow };
  }
}
