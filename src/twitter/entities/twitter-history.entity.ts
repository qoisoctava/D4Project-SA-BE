import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TwitterPredicted } from './twitter-predicted.entity';

export enum AnalysisStatus {
  COLLECTING = 1,
  PROCESSING = 2,
  PREDICTING = 3,
  COMPLETED = 4,
  FAILED = 5,
}

@Entity('twitter_history')
export class TwitterHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid') // Explicitly specify this is a UUID column
  userId: string;

  @ManyToOne(() => User, user => user.twitterHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 255 })
  keyword: string;

  @Column({ name: 'since_date', type: 'date' })
  sinceDate: Date;

  @Column({ name: 'until_date', type: 'date' })
  untilDate: Date;

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.COLLECTING,
  })
  status: AnalysisStatus;

  @OneToMany(() => TwitterPredicted, twitterPredicted => twitterPredicted.history)
  predictions: TwitterPredicted[];

  @CreateDateColumn({ name: 'get_date' })
  getDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}