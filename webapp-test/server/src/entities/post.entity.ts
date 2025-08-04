import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany, 
} from 'typeorm';
import { User } from './user.entity'; 
import { Like } from './like.entity';
import { Comment } from './comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 5000 })
  text: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' }) 
  user: User;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  @OneToMany(() => Like, like => like.post)
  likes: Like[];

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];
}
