import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { MurmurController } from './murmur.controller';
import { MurmurService } from './murmur.service';
import { Follow } from 'src/entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Murmur, Like, User,Follow])],
  providers: [MurmurService],
  exports: [MurmurService],
  controllers: [MurmurController],
})
export class MurmurModule {}
