import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Follow) // Inject FollowRepository
    private readonly followRepository: Repository<Follow>,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      userId,
    });
    return this.postRepository.save(post);
  }

  async getPosts(
    page: number = 1,
    limit: number = 10,
    loggedInUserId?: number | null,
  ): Promise<{ posts: any[]; total: number }> {
    const [postsData, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (loggedInUserId) {
      const postsWithIsLiked = await Promise.all(
        postsData.map(async (post) => {
          const like = await this.likeRepository.findOneBy({
            postId: post.id,
            userId: loggedInUserId,
          });
          return { ...post, isLiked: !!like };
        }),
      );
      return { posts: postsWithIsLiked, total };
    }

    return { posts: postsData, total };
  }

  async getPostById(id: number, loggedInUserId?: number | null): Promise<any | null> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id })
      .leftJoinAndSelect('post.user', 'user')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    if (loggedInUserId) {
      const like = await this.likeRepository.findOneBy({
        postId: post.id,
        userId: loggedInUserId,
      });
      return { ...post, isLiked: !!like };
    }
    return post;
  }

  async deletePost(id: number, userId: number): Promise<void> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this post');
    }
    await this.postRepository.delete(id);
  }

  async likePost(userId: number, postId: number): Promise<Like> {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const existingLike = await this.likeRepository.findOneBy({
      userId,
      postId,
    });
    if (existingLike) {
      throw new ConflictException('You have already liked this post');
    }

    const like = this.likeRepository.create({ userId, postId });
    return this.likeRepository.save(like);
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    const like = await this.likeRepository.findOneBy({ userId, postId });
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    await this.likeRepository.delete(like.id);
  }

  async getLikesCountForPost(postId: number): Promise<number> {
    return this.likeRepository.count({ where: { postId } });
  }

  async getTimeline(
    loggedInUserId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: any[]; total: number }> {
    const [postsData, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const postsWithIsLiked = await Promise.all(
      postsData.map(async (post) => {
        const like = await this.likeRepository.findOneBy({
          postId: post.id,
          userId: loggedInUserId,
        });
        return { ...post, isLiked: !!like };
      }),
    );

    return { posts: postsWithIsLiked, total };
  }

  async getPostsByUserIdWithLikes(
    targetUserId: number,
    page: number = 1,
    limit: number = 10,
    loggedInUserId?: number | null,
  ): Promise<{ posts: any[]; total: number }> {
    const [postsData, total] = await this.postRepository
      .createQueryBuilder('post')
      .where('post.userId = :targetUserId', { targetUserId })
      .leftJoinAndSelect('post.user', 'user')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (loggedInUserId) {
      const postsWithIsLiked = await Promise.all(
        postsData.map(async (post) => {
          try {
            const like = await this.likeRepository.findOneBy({
              postId: post.id,
              userId: loggedInUserId as number,
            });
            return { ...post, isLiked: !!like };
          } catch (error) {
            console.error(`Error checking like status for post ${post.id} and user ${loggedInUserId}:`, error);
            return { ...post, isLiked: false };
          }
        }),
      );
      return { posts: postsWithIsLiked, total };
    }
    return { posts: postsData.map(m => ({...m, isLiked: false })), total };
  }
}
