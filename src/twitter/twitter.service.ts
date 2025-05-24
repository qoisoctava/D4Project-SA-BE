import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitterHistory, AnalysisStatus } from './entities/twitter-history.entity';
import { TwitterPredicted, SentimentType } from './entities/twitter-predicted.entity';
import { CreateTwitterAnalysisDto } from './dto/create-twitter-analysis.dto';
import { CreateTwitterPredictionDto } from './dto/create-twitter-prediction.dto';

@Injectable()
export class TwitterService {
  constructor(
    @InjectRepository(TwitterHistory)
    private twitterHistoryRepository: Repository<TwitterHistory>,
    @InjectRepository(TwitterPredicted)
    private twitterPredictedRepository: Repository<TwitterPredicted>,
  ) {}

  async createAnalysis(userId: string, createAnalysisDto: CreateTwitterAnalysisDto): Promise<TwitterHistory> {
    const analysis = this.twitterHistoryRepository.create({
      userId,
      keyword: createAnalysisDto.keyword,
      sinceDate: new Date(createAnalysisDto.dateSince),
      untilDate: new Date(createAnalysisDto.dateUntil),
      status: AnalysisStatus.COLLECTING,
    });

    const savedAnalysis = await this.twitterHistoryRepository.save(analysis);

    // Here you would typically trigger your external sentiment analysis service
    // For now, we'll just return the created analysis
    return savedAnalysis;
  }

  async findAllAnalyses(page: number = 1, limit: number = 10): Promise<{ data: TwitterHistory[]; total: number }> {
    const [data, total] = await this.twitterHistoryRepository.findAndCount({
      relations: ['user'],
      order: { getDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findUserAnalyses(userId: string, page: number = 1, limit: number = 10): Promise<{ data: TwitterHistory[]; total: number }> {
    const [data, total] = await this.twitterHistoryRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      order: { getDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOneAnalysis(id: string, userId?: string): Promise<TwitterHistory> {
    const analysis = await this.twitterHistoryRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!analysis) {
      throw new NotFoundException(`Twitter analysis with ID "${id}" not found`);
    }

    // If userId is provided, check if user owns this analysis or is admin
    if (userId && analysis.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this analysis');
    }

    return analysis;
  }

  async findAnalysisData(id: string, userId?: string): Promise<TwitterPredicted[]> {
    // First verify the analysis exists and user has permission
    await this.findOneAnalysis(id, userId);

    return this.twitterPredictedRepository.find({
      where: { historyId: id },
      order: { popularityScore: 'DESC' },
    });
  }

  async findAnalysisCount(id: string, userId?: string): Promise<any> {
    // Verify permission
    await this.findOneAnalysis(id, userId);

    const result = await this.twitterPredictedRepository
      .createQueryBuilder('tp')
      .select('COUNT(tp.tweet)', 'total')
      .addSelect('COUNT(CASE WHEN tp.sentiment = :positive THEN 1 END)', 'positive')
      .addSelect('COUNT(CASE WHEN tp.sentiment = :neutral THEN 1 END)', 'neutral')
      .addSelect('COUNT(CASE WHEN tp.sentiment = :negative THEN 1 END)', 'negative')
      .where('tp.historyId = :id', { id })
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
    // Verify permission
    await this.findOneAnalysis(id, userId);

    const results = await this.twitterPredictedRepository
      .createQueryBuilder('tp')
      .select('DATE(tp.contentDate)', 'contentDate')
      .addSelect('COUNT(CASE WHEN tp.sentiment = :positive THEN 1 END)', 'positive')
      .addSelect('COUNT(CASE WHEN tp.sentiment = :neutral THEN 1 END)', 'neutral')
      .addSelect('COUNT(CASE WHEN tp.sentiment = :negative THEN 1 END)', 'negative')
      .where('tp.historyId = :id', { id })
      .setParameters({
        positive: SentimentType.POSITIVE,
        neutral: SentimentType.NEUTRAL,
        negative: SentimentType.NEGATIVE,
      })
      .groupBy('DATE(tp.contentDate)')
      .orderBy('DATE(tp.contentDate)', 'ASC')
      .getRawMany();

    return results.map(result => ({
      contentDate: result.contentDate,
      positive: parseInt(result.positive),
      neutral: parseInt(result.neutral),
      negative: parseInt(result.negative),
    }));
  }

  async createPrediction(createPredictionDto: CreateTwitterPredictionDto): Promise<TwitterPredicted> {
    const prediction = this.twitterPredictedRepository.create({
      ...createPredictionDto,
      contentDate: new Date(createPredictionDto.contentDate),
    });

    return this.twitterPredictedRepository.save(prediction);
  }

  async updateAnalysisStatus(id: string, status: AnalysisStatus): Promise<TwitterHistory> {
    const analysis = await this.findOneAnalysis(id);
    analysis.status = status;
    return this.twitterHistoryRepository.save(analysis);
  }

  async getAllTopics(): Promise<string[]> {
    const result = await this.twitterPredictedRepository
      .createQueryBuilder('tp')
      .select('DISTINCT tp.topic', 'topic')
      .getRawMany();

    return result.map(item => item.topic);
  }
}