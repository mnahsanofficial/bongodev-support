import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { jwtConstants } from './constants';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
        useFactory: () => ({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: jwtConstants.expiresIn },
        }),
        imports: undefined
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy,OptionalJwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
