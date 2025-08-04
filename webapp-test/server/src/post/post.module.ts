import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Follow } from 'src/entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Like, User,Follow])],
  providers: [PostService],
  exports: [PostService],
  controllers: [PostController],
})
export class PostModule {}
