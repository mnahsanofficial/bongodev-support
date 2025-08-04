import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { Follow } from './entities/follow.entity';
import { CommentModule } from './comment/comment.module';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'post_app',
      entities: [User, Post, Like, Follow, Comment],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Post, Like, Follow, Comment]),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
