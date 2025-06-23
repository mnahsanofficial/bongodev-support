import {
  Controller,
  Post,
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
import { CreateMurmurDto } from './dto/create-murmur.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard'; // Import OptionalJwtAuthGuard
import { MurmurService } from './murmur.service';

@Controller('api')
export class MurmurController {
  constructor(private readonly murmurService: MurmurService) {}

  @UseGuards(JwtAuthGuard)
  @Post('me/murmurs')
  async createMurmur(@Body() createMurmurDto: CreateMurmurDto, @Req() req) {
    const userId = req.user.userId;
    return this.murmurService.createMurmur(createMurmurDto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard) // Use optional guard
  @Get('murmurs')
  async getMurmurs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req,
  ) {
    const loggedInUserId = req.user?.userId;
    return this.murmurService.getMurmurs(page, limit, loggedInUserId);
  }

   @UseGuards(JwtAuthGuard)
  @Get('me/timeline')
  async getTimeline(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.userId;
    return this.murmurService.getTimeline(userId, page, limit);
  }

  @UseGuards(OptionalJwtAuthGuard) // Use optional guard
  @Get('murmurs/:id')
  async getMurmurById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const loggedInUserId = req.user?.userId;
    return this.murmurService.getMurmurById(id, loggedInUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/murmurs/:id')
  @HttpCode(204)
  async deleteMurmur(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.userId;
    return this.murmurService.deleteMurmur(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('murmurs/:id/like')
  async likeMurmur(@Param('id', ParseIntPipe) murmurId: number, @Req() req) {
    const userId = req.user.userId;
    return this.murmurService.likeMurmur(userId, murmurId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('murmurs/:id/like')
  @HttpCode(204)
  async unlikeMurmur(@Param('id', ParseIntPipe) murmurId: number, @Req() req) {
    const userId = req.user.userId;
    return this.murmurService.unlikeMurmur(userId, murmurId);
  }
}
