import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { YoutubeController } from './youtube.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeHistory } from './entities/youtube-history.entity';
import { YoutubePredicted } from './entities/youtube-predicted.entity';

@Module({
  imports: [TypeOrmModule.forFeature([YoutubeHistory, YoutubePredicted])],
  controllers: [YoutubeController],
  providers: [YoutubeService],
  exports: [YoutubeService],
})
export class YoutubeModule {}