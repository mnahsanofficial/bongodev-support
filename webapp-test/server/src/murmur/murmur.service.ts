import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity'; // User might be used later
import { CreateMurmurDto } from './dto/create-murmur.dto';

@Injectable()
export class MurmurService {
  constructor(
    @InjectRepository(Murmur)
    private readonly murmurRepository: Repository<Murmur>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
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

  async getMurmurs(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ murmurs: Murmur[]; total: number }> {
    const [murmurs, total] = await this.murmurRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { murmurs, total };
  }

  async getMurmurById(id: number): Promise<Murmur | null> {
    const murmur = await this.murmurRepository.findOneBy({ id });
    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${id} not found`);
    }
    return murmur;
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
}
