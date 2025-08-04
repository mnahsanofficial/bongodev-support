import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Follow } from './follow.entity';
import { Comment } from './comment.entity';
import { CommentReaction } from './comment-reaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ select: false })
  password: string;

  @Column({ default: 0 })
  followCount: number;

  @Column({ default: 0 })
  followedCount: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  // A user can be followed by many users. This list shows who is following the current user.
  // 'follow.following' means: in the Follow entity, the 'following' property maps to this User entity (the one being followed).
  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  // A user can follow many other users. This list shows who the current user is following.
  // 'follow.follower' means: in the Follow entity, the 'follower' property maps to this User entity (the one doing the following).
  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => CommentReaction, (reaction) => reaction.user)
  commentReactions: CommentReaction[];
}
