import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';

@Entity('comment_reactions')
@Index(['userId', 'commentId', 'reactionType'], { unique: true })
export class CommentReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  commentId: number;

  @Column()
  reactionType: string;

  @ManyToOne(() => User, (user) => user.commentReactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.reactions)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;
}
