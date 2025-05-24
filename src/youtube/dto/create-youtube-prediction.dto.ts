import { IsString, IsNotEmpty, IsDateString, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { SentimentType } from '../../twitter/entities/twitter-predicted.entity';

export class CreateYoutubePredictionDto {
  @IsNotEmpty()
  @IsUUID()
  historyId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()  
  @IsString()
  channelName: string;

  @IsNotEmpty()
  @IsDateString()
  videoDate: string;

  @IsNotEmpty()
  @IsDateString()
  commentDate: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNumber()
  likeCount: number;

  @IsNotEmpty()
  @IsString()
  commentator: string;

  @IsNotEmpty()
  @IsEnum(SentimentType)
  sentiment: SentimentType;

  @IsNotEmpty()
  @IsString()
  topic: string;
}