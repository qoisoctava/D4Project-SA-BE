import { Module } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { TwitterController } from './twitter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterHistory } from './entities/twitter-history.entity';
import { TwitterPredicted } from './entities/twitter-predicted.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TwitterHistory, TwitterPredicted])],
  controllers: [TwitterController],
  providers: [TwitterService],
  exports: [TwitterService],
})
export class TwitterModule {}