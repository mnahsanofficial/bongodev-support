import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity'; 
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PostModule } from 'src/post/post.module';
import { Post } from 'src/entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Follow]),
    PostModule, 
  ], 
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
