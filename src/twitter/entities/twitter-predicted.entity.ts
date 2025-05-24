import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TwitterHistory } from './twitter-history.entity';

export enum SentimentType {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
}

@Entity('twitter_predicted')
export class TwitterPredicted {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid') // Explicitly specify this is a UUID column
  historyId: string;

  @ManyToOne(() => TwitterHistory, history => history.predictions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historyId' })
  history: TwitterHistory;

  @Column({ length: 255 })
  keyword: string;

  @Column({ name: 'content_date', type: 'datetime' })
  contentDate: Date;

  @Column({ length: 255 })
  username: string;

  @Column({ type: 'text' })
  tweet: string;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'retweet_count', default: 0 })
  retweetCount: number;

  @Column({ name: 'reply_count', default: 0 })
  replyCount: number;

  @Column({ name: 'popularity_score', type: 'decimal', precision: 10, scale: 2, default: 0 })
  popularityScore: number;

  @Column({
    type: 'enum',
    enum: SentimentType,
  })
  sentiment: SentimentType;

  @Column({ length: 255 })
  topic: string;

  @CreateDateColumn({ name: 'get_date' })
  getDate: Date;
}