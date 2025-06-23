import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Murmur } from './entities/murmur.entity';
import { Like } from './entities/like.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MurmurModule } from './murmur/murmur.module';
import { Follow } from './entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'murmur_app', // Updated database name
      entities: [User, Murmur, Like,Follow], 
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Murmur, Like,Follow]),
    AuthModule,
    UserModule,
    MurmurModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
