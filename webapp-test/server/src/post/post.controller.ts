import {
  Controller,
  Post as PostRequest,
  Body,
  Get,
  Query,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { PostService } from './post.service';

@Controller('api')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @PostRequest('me/posts')
  async createPost(@Body() createPostDto: CreatePostDto, @Req() req) {
    const userId = req.user.userId;
    return this.postService.createPost(createPostDto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('posts')
  async getPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req,
  ) {
    const loggedInUserId = req.user?.userId;
    return this.postService.getPosts(page, limit, loggedInUserId);
  }

   @UseGuards(JwtAuthGuard)
  @Get('me/timeline')
  async getTimeline(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.userId;
    return this.postService.getTimeline(userId, page, limit);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('posts/:id')
  async getPostById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const loggedInUserId = req.user?.userId;
    return this.postService.getPostById(id, loggedInUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/posts/:id')
  @HttpCode(204)
  async deletePost(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.userId;
    return this.postService.deletePost(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @PostRequest('posts/:id/like')
  async likePost(@Param('id', ParseIntPipe) postId: number, @Req() req) {
    const userId = req.user.userId;
    return this.postService.likePost(userId, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id/like')
  @HttpCode(204)
  async unlikePost(@Param('id', ParseIntPipe) postId: number, @Req() req) {
    const userId = req.user.userId;
    return this.postService.unlikePost(userId, postId);
  }
}
