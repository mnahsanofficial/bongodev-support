import {
  Controller,
  Request,
  Post,
  Get, // Added Get
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../user/user.service'; // Added UserService

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService, // Injected UserService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    // loginDto is implicitly validated by LocalStrategy via LocalAuthGuard
    // which calls authService.validateUser
    // If successful, req.user is populated by LocalStrategy
    return this.authService.login(req.user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Get authenticated user's profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    // req.user contains payload { userId: number, email: string, ... }
    const userId = req.user.userId;
    // Fetch the full user details using UserService, excluding password
    return this.userService.getUserById(userId);
  }
}
