import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { CommentReaction } from '../entities/comment-reaction.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post, CommentReaction])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
