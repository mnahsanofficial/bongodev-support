import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { bcryptConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    // Ideally, UserService should have a method like findUserByNameForAuth
    // that returns the user with the password.
    // For now, injecting UserRepository directly to get password.
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { name: username },
      select: ['id', 'name', 'password', 'followCount', 'followedCount', 'createdAt', 'updatedAt'], // Need password for validation
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findOneBy({ name: registerDto.username });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      bcryptConstants.saltOrRounds,
    );

    const newUser = this.userRepository.create({
      name: registerDto.username,
      password: hashedPassword,
      // followCount and followedCount will use default values from entity
    });

    const savedUser = await this.userRepository.save(newUser);
    const { password, ...result } = savedUser;
    return result;
  }
}
