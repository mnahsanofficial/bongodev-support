import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Column } from 'typeorm';
import { User } from './user.entity';
import { Murmur } from './murmur.entity';

@Entity('likes')
@Unique(['user_id', 'murmur_id'])
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => User, user => user.likes, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  user_id!: number;

  @ManyToOne(() => Murmur, murmur => murmur.likes, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'murmur_id' })
  murmur!: Murmur;

  @Column()
  murmur_id!: number;
}
