import { Controller, Post, Body, Get, Param, UseGuards, Req, ParseIntPipe, Delete, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentService } from './comment.service';

@Controller('api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    const userId = req.user.userId;
    return this.commentService.createComment(createCommentDto, userId);
  }

  @Get('post/:postId')
  async getCommentsByPostId(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.getCommentsByPostId(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':commentId/reactions')
  async addReaction(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body('reactionType') reactionType: string,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.commentService.addReaction(userId, commentId, reactionType);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId/reactions')
  @HttpCode(204)
  async removeReaction(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body('reactionType') reactionType: string,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.commentService.removeReaction(userId, commentId, reactionType);
  }
}
