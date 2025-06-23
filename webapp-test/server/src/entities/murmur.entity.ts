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

@Entity()
export class Murmur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 280 })
  text: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' }) 
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Like, like => like.murmur)
  likes: Like[];
}
