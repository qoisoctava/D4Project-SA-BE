import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { YoutubeHistory } from './youtube-history.entity';
import { SentimentType } from '../../twitter/entities/twitter-predicted.entity';

@Entity('youtube_predicted')
export class YoutubePredicted {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid') // Explicitly specify this is a UUID column
  historyId: string;

  @ManyToOne(() => YoutubeHistory, history => history.predictions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historyId' })
  history: YoutubeHistory;

  @Column({ length: 500 })
  title: string;

  @Column({ name: 'channel_name', length: 255 })
  channelName: string;

  @Column({ name: 'video_date', type: 'date' })
  videoDate: Date;

  @Column({ name: 'comment_date', type: 'datetime' })
  commentDate: Date;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ length: 255 })
  commentator: string;

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