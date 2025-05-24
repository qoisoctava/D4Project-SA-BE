import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateYoutubeAnalysisDto {
  @IsNotEmpty()
  @IsString()
  videoId: string;

  @IsNotEmpty()
  @IsString()
  topic: string;
}