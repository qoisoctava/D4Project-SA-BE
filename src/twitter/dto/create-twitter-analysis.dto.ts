import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTwitterAnalysisDto {
  @IsNotEmpty()
  @IsString()
  keyword: string;

  @IsNotEmpty()
  @IsDateString()
  dateSince: string;

  @IsNotEmpty()
  @IsDateString()
  dateUntil: string;

  @IsNotEmpty()
  @IsString()
  topic: string;
}