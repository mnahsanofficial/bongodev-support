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
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import JwtAuthGuard
import { MurmurService } from './murmur.service';

@Controller('api')
export class MurmurController {
  constructor(private readonly murmurService: MurmurService) {}

  @UseGuards(JwtAuthGuard) // Protect this route
  @Post('me/murmurs')
  async createMurmur(@Body() createMurmurDto: CreateMurmurDto, @Req() req) {
    const userId = req.user.userId; // Get userId from token payload
    return this.murmurService.createMurmur(createMurmurDto, userId);
  }

  @Get('murmurs')
  async getMurmurs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.murmurService.getMurmurs(page, limit);
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

  @Get('murmurs/:id')
  async getMurmurById(@Param('id', ParseIntPipe) id: number) {
    return this.murmurService.getMurmurById(id);
  }

  @UseGuards(JwtAuthGuard) // Protect this route
  @Delete('me/murmurs/:id')
  @HttpCode(204)
  async deleteMurmur(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.userId; // Get userId from token payload
    return this.murmurService.deleteMurmur(id, userId);
  }

  @UseGuards(JwtAuthGuard) // Protect this route
  @Post('murmurs/:id/like')
  async likeMurmur(@Param('id', ParseIntPipe) murmurId: number, @Req() req) {
    const userId = req.user.userId; // Get userId from token payload
    return this.murmurService.likeMurmur(userId, murmurId);
  }

  @UseGuards(JwtAuthGuard) // Protect this route
  @Delete('murmurs/:id/like')
  @HttpCode(204)
  async unlikeMurmur(@Param('id', ParseIntPipe) murmurId: number, @Req() req) {
    const userId = req.user.userId; // Get userId from token payload
    return this.murmurService.unlikeMurmur(userId, murmurId);
  }
}
