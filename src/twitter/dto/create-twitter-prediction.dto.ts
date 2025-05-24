import { IsString, IsNotEmpty, IsDateString, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { SentimentType } from '../entities/twitter-predicted.entity';

export class CreateTwitterPredictionDto {
  @IsNotEmpty()
  @IsUUID()
  historyId: string;

  @IsNotEmpty()
  @IsString()
  keyword: string;

  @IsNotEmpty()
  @IsDateString()
  contentDate: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  tweet: string;

  @IsNumber()
  likeCount: number;

  @IsNumber()
  retweetCount: number;

  @IsNumber()
  replyCount: number;

  @IsNumber()
  popularityScore: number;

  @IsNotEmpty()
  @IsEnum(SentimentType)
  sentiment: SentimentType;

  @IsNotEmpty()
  @IsString()
  topic: string;
}