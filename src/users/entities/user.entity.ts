import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { TwitterHistory } from '../../twitter/entities/twitter-history.entity';
import { YoutubeHistory } from '../../youtube/entities/youtube-history.entity';

export enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
  VIEWER = 'viewer',
}

@Entity('users') // Explicitly name the table
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @OneToMany(() => TwitterHistory, twitterHistory => twitterHistory.user)
  twitterHistories: TwitterHistory[];

  @OneToMany(() => YoutubeHistory, youtubeHistory => youtubeHistory.user)
  youtubeHistories: YoutubeHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}