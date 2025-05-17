import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TwitterHistory } from '../../twitter/entities/twitter-history.entity';
import { YoutubeHistory } from '../../youtube/entities/youtube-history.entity';


export enum UserRole{
    ADMIN = 'admin',
    ANALYST = 'analyst',
    VIEWER = 'viewer',
}

@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column({unique: true})
    username: string

    @Column({unique: true})
    email: string

    @Column()
    @Exclude()
    password: string

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.VIEWER
    })
    role: UserRole

    @OneToMany(() => TwitterHistory, twitterHistory => twitterHistory.user)
    twitterHistories: TwitterHistory[];

    @OneToMany(() => YoutubeHistory, youtubeHistory => youtubeHistory.user)
    youtubeHistories: YoutubeHistory[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}