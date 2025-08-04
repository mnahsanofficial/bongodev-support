import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/entities/post.entity';
import { CommentReaction } from 'src/entities/comment-reaction.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(CommentReaction)
    private readonly commentReactionRepository: Repository<CommentReaction>,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    const { postId, text, parentId } = createCommentDto;

    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (parentId) {
      const parentComment = await this.commentRepository.findOneBy({ id: parentId });
      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${parentId} not found`);
      }
    }

    const comment = this.commentRepository.create({
      text,
      userId,
      postId,
      parentId,
    });

    return this.commentRepository.save(comment);
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
        where: { postId, parentId: null }, // Fetch only top-level comments
        relations: ['user', 'replies', 'replies.user', 'reactions', 'reactions.user'],
        order: { createdAt: 'ASC' },
    });

    // A recursive function to load reactions for nested replies
    const loadReactionsForReplies = async (comment: Comment) => {
        if (comment.replies && comment.replies.length > 0) {
            for (const reply of comment.replies) {
                const reactions = await this.commentReactionRepository.find({
                    where: { commentId: reply.id },
                    relations: ['user'],
                });
                reply.reactions = reactions;
                await loadReactionsForReplies(reply); // Recurse
            }
        }
    };

    for (const comment of comments) {
        await loadReactionsForReplies(comment);
    }

    return comments;
}


  async addReaction(userId: number, commentId: number, reactionType: string): Promise<CommentReaction> {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    const existingReaction = await this.commentReactionRepository.findOne({ where: { userId, commentId, reactionType } });
    if (existingReaction) {
      throw new ConflictException('You have already reacted to this comment with this type');
    }

    const reaction = this.commentReactionRepository.create({ userId, commentId, reactionType });
    return this.commentReactionRepository.save(reaction);
  }

  async removeReaction(userId: number, commentId: number, reactionType: string): Promise<void> {
    const reaction = await this.commentReactionRepository.findOne({ where: { userId, commentId, reactionType } });
    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }
    await this.commentReactionRepository.delete(reaction.id);
  }
}
