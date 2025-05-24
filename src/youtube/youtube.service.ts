import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YoutubeHistory } from './entities/youtube-history.entity';
import { YoutubePredicted } from './entities/youtube-predicted.entity';
import { CreateYoutubeAnalysisDto } from './dto/create-youtube-analysis.dto';
import { CreateYoutubePredictionDto } from './dto/create-youtube-prediction.dto';
import { AnalysisStatus } from '../twitter/entities/twitter-history.entity';
import { SentimentType } from '../twitter/entities/twitter-predicted.entity';

@Injectable()
export class YoutubeService {
  constructor(
    @InjectRepository(YoutubeHistory)
    private youtubeHistoryRepository: Repository<YoutubeHistory>,
    @InjectRepository(YoutubePredicted)
    private youtubePredictedRepository: Repository<YoutubePredicted>,
  ) {}

  async createAnalysis(userId: string, createAnalysisDto: CreateYoutubeAnalysisDto): Promise<YoutubeHistory> {
    const analysis = this.youtubeHistoryRepository.create({
      userId,
      videoId: createAnalysisDto.videoId,
      title: '', 
      channelName: '',
      videoDate: new Date(), 
      status: AnalysisStatus.COLLECTING,
    });

    const savedAnalysis = await this.youtubeHistoryRepository.save(analysis);

    return savedAnalysis;
  }

  async findAllAnalyses(page: number = 1, limit: number = 10): Promise<{ data: YoutubeHistory[]; total: number }> {
    const [data, total] = await this.youtubeHistoryRepository.findAndCount({
      relations: ['user'],
      order: { getDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findUserAnalyses(userId: string, page: number = 1, limit: number = 10): Promise<{ data: YoutubeHistory[]; total: number }> {
    const [data, total] = await this.youtubeHistoryRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      order: { getDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOneAnalysis(id: string, userId?: string): Promise<YoutubeHistory> {
    const analysis = await this.youtubeHistoryRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!analysis) {
      throw new NotFoundException(`YouTube analysis with ID "${id}" not found`);
    }

    if (userId && analysis.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this analysis');
    }

    return analysis;
  }

  async findAnalysisData(id: string, userId?: string): Promise<YoutubePredicted[]> {
    await this.findOneAnalysis(id, userId);

    return this.youtubePredictedRepository.find({
      where: { historyId: id },
      order: { likeCount: 'DESC' },
    });
  }

  async findAnalysisCount(id: string, userId?: string): Promise<any> {
    await this.findOneAnalysis(id, userId);

    const result = await this.youtubePredictedRepository
      .createQueryBuilder('yp')
      .select('COUNT(yp.content)', 'total')
      .addSelect('COUNT(CASE WHEN yp.sentiment = :positive THEN 1 END)', 'positive')
      .addSelect('COUNT(CASE WHEN yp.sentiment = :neutral THEN 1 END)', 'neutral')
      .addSelect('COUNT(CASE WHEN yp.sentiment = :negative THEN 1 END)', 'negative')
      .where('yp.historyId = :id', { id })
      .setParameters({
        positive: SentimentType.POSITIVE,
        neutral: SentimentType.NEUTRAL,
        negative: SentimentType.NEGATIVE,
      })
      .getRawOne();

    return {
      total: parseInt(result.total),
      positive: parseInt(result.positive),
      neutral: parseInt(result.neutral),
      negative: parseInt(result.negative),
    };
  }

  async findAnalysisSummary(id: string, userId?: string): Promise<any[]> {
    await this.findOneAnalysis(id, userId);

    const results = await this.youtubePredictedRepository
      .createQueryBuilder('yp')
      .select('DATE(yp.commentDate)', 'commentDate')
      .addSelect('COUNT(CASE WHEN yp.sentiment = :positive THEN 1 END)', 'positive')
      .addSelect('COUNT(CASE WHEN yp.sentiment = :neutral THEN 1 END)', 'neutral')
      .addSelect('COUNT(CASE WHEN yp.sentiment = :negative THEN 1 END)', 'negative')
      .where('yp.historyId = :id', { id })
      .setParameters({
        positive: SentimentType.POSITIVE,
        neutral: SentimentType.NEUTRAL,
        negative: SentimentType.NEGATIVE,
      })
      .groupBy('DATE(yp.commentDate)')
      .orderBy('DATE(yp.commentDate)', 'ASC')
      .getRawMany();

    return results.map(result => ({
      commentDate: result.commentDate,
      positive: parseInt(result.positive),
      neutral: parseInt(result.neutral),
      negative: parseInt(result.negative),
    }));
  }

  async createPrediction(createPredictionDto: CreateYoutubePredictionDto): Promise<YoutubePredicted> {
    const prediction = this.youtubePredictedRepository.create({
      ...createPredictionDto,
      videoDate: new Date(createPredictionDto.videoDate),
      commentDate: new Date(createPredictionDto.commentDate),
    });

    return this.youtubePredictedRepository.save(prediction);
  }

  async updateAnalysisStatus(id: string, status: AnalysisStatus): Promise<YoutubeHistory> {
    const analysis = await this.findOneAnalysis(id);
    analysis.status = status;
    return this.youtubeHistoryRepository.save(analysis);
  }

  async updateAnalysisDetails(id: string, title: string, channelName: string, videoDate: Date): Promise<YoutubeHistory> {
    const analysis = await this.findOneAnalysis(id);
    analysis.title = title;
    analysis.channelName = channelName;
    analysis.videoDate = videoDate;
    return this.youtubeHistoryRepository.save(analysis);
  }

  async getAllTopics(): Promise<string[]> {
    const result = await this.youtubePredictedRepository
      .createQueryBuilder('yp')
      .select('DISTINCT yp.topic', 'topic')
      .getRawMany();

    return result.map(item => item.topic);
  }
}