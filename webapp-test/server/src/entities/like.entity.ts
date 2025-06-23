import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Murmur } from './murmur.entity';

@Entity()
@Index(['userId', 'murmurId'], { unique: true })
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  murmurId: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Murmur)
  murmur: Murmur;
}
