import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentService } from '../comment/comment.service';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';
import { NotFoundException } from '@nestjs/common';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: Repository<Comment>;
  let postRepository: Repository<Post>;

  const mockCommentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockPostRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const createCommentDto: CreateCommentDto = {
        text: 'Test comment',
        postId: 1,
      };
      const userId = 1;
      const post = { id: 1, text: 'Test Post' } as Post;
      const comment = { id: 1, ...createCommentDto, userId } as Comment;

      mockPostRepository.findOneBy.mockResolvedValue(post);
      mockCommentRepository.create.mockReturnValue(comment);
      mockCommentRepository.save.mockResolvedValue(comment);

      const result = await service.createComment(createCommentDto, userId);

      expect(result).toEqual(comment);
      expect(mockPostRepository.findOneBy).toHaveBeenCalledWith({ id: createCommentDto.postId });
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        ...createCommentDto,
        userId,
      });
      expect(mockCommentRepository.save).toHaveBeenCalledWith(comment);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      const createCommentDto: CreateCommentDto = {
        text: 'Test comment',
        postId: 1,
      };
      const userId = 1;

      mockPostRepository.findOneBy.mockResolvedValue(null);

      await expect(service.createComment(createCommentDto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCommentsByPostId', () => {
    it('should return an array of comments', async () => {
      const postId = 1;
      const comments = [{ id: 1, text: 'Test Comment', postId }] as Comment[];

      mockCommentRepository.find.mockResolvedValue(comments);

      const result = await service.getCommentsByPostId(postId);

      expect(result).toEqual(comments);
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
        where: { postId },
        relations: ['user', 'replies', 'replies.user'],
        order: { createdAt: 'ASC' },
      });
    });
  });
});
