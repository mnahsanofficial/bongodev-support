import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Like } from './like.entity';

@Entity('murmurs')
export class Murmur {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  text!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => User, user => user.murmurs, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column() 
  user_id!: number;

  @OneToMany(() => Like, like => like.murmur)
  likes!: Like[];
}
