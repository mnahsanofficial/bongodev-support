import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Murmur } from '../entities/murmur.entity';
import { Follow } from '../entities/follow.entity'; 
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MurmurModule } from 'src/murmur/murmur.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Murmur, Follow]),
    MurmurModule, 
  ], 
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
