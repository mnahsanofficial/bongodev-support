import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Murmur } from './murmur.entity';
import { Follow } from './follow.entity';
import { Like } from './like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => Murmur, murmur => murmur.user)
  murmurs!: Murmur[];

  @OneToMany(() => Follow, follow => follow.follower)
  following!: Follow[];

  @OneToMany(() => Follow, follow => follow.following)
  followers!: Follow[];

  @OneToMany(() => Like, like => like.user)
  likes!: Like[];
}
