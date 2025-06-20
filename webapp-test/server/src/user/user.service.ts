import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Murmur } from '../entities/murmur.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Murmur)
    private readonly murmurRepository: Repository<Murmur>,
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
}
