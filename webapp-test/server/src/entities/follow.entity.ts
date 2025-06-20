import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Column } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Unique(['follower_id', 'following_id'])
export class Follow {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => User, user => user.following, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower!: User;

  @Column()
  follower_id!: number;

  @ManyToOne(() => User, user => user.followers, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following!: User;

  @Column()
  following_id!: number;
}
