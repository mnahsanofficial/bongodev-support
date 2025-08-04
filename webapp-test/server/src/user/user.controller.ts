import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Post,
  Delete,
  HttpCode,
  UseGuards,
  Req,
  Optional,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PostService } from '../post/post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/posts')
  async getPostsByUserId(
    @Param('id', ParseIntPipe) targetUserId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req,
  ) {
    const loggedInUserId = req.user?.userId;
    return this.postService.getPostsByUserIdWithLikes(targetUserId, page, limit, loggedInUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async followUser(@Param('id', ParseIntPipe) followingId: number, @Req() req) {
    const followerId = req.user.userId;
    return this.userService.followUser(followerId, followingId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  @HttpCode(204)
  async unfollowUser(@Param('id', ParseIntPipe) followingId: number, @Req() req) {
    const followerId = req.user.userId;
    return this.userService.unfollowUser(followerId, followingId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/is-following')
  async isFollowing(
    @Param('id', ParseIntPipe) followingId: number,
    @Req() req,
  ) {
    const followerId = req.user.userId;
    return this.userService.isFollowing(followerId, followingId);
  }
}
