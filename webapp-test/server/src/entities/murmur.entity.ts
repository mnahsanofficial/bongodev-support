import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity'; // Import User entity

@Entity()
export class Murmur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 280 })
  text: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, { eager: false }) // eager: false is typical, joined when selected
  @JoinColumn({ name: 'userId' }) // Specifies the foreign key column
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
