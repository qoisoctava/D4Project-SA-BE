import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { YoutubePredicted } from './youtube-predicted.entity';
import { AnalysisStatus } from '../../twitter/entities/twitter-history.entity';

@Entity('youtube_history')
export class YoutubeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid') // Explicitly specify this is a UUID column
  userId: string;

  @ManyToOne(() => User, user => user.youtubeHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'video_id', length: 255 })
  videoId: string;

  @Column({ length: 500 })
  title: string;

  @Column({ name: 'channel_name', length: 255 })
  channelName: string;

  @Column({ name: 'video_date', type: 'date' })
  videoDate: Date;

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.COLLECTING,
  })
  status: AnalysisStatus;

  @OneToMany(() => YoutubePredicted, youtubePredicted => youtubePredicted.history)
  predictions: YoutubePredicted[];

  @CreateDateColumn({ name: 'get_date' })
  getDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}