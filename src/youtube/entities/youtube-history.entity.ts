import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { YoutubePredicted } from './youtube-predicted.entity';
import { AnalysisStatus } from '../../twitter/entities/twitter-history.entity';

@Entity('youtube_history')
export class YoutubeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.youtubeHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'video_id' })
  videoId: string;

  @Column()
  title: string;

  @Column({ name: 'channel_name' })
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