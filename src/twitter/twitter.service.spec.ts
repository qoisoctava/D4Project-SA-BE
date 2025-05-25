import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { TwitterHistory, AnalysisStatus } from './entities/twitter-history.entity';
import { TwitterPredicted, SentimentType } from './entities/twitter-predicted.entity';
import { CreateTwitterAnalysisDto } from './dto/create-twitter-analysis.dto';

describe('TwitterService', () => {
  let service: TwitterService;
  let historyRepository: jest.Mocked<Repository<TwitterHistory>>;
  let predictedRepository: jest.Mocked<Repository<TwitterPredicted>>;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockAnalysisId = '987fcdeb-51a2-43d7-8f6b-123456789012';

  const mockTwitterHistory: TwitterHistory = {
    id: mockAnalysisId,
    userId: mockUserId,
    user: null,
    keyword: 'test keyword',
    sinceDate: new Date('2023-01-01'),
    untilDate: new Date('2023-01-07'),
    status: AnalysisStatus.COMPLETED,
    predictions: [],
    getDate: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateAnalysisDto: CreateTwitterAnalysisDto = {
    keyword: 'test keyword',
    dateSince: '2023-01-01',
    dateUntil: '2023-01-07',
    topic: 'politics',
  };

  beforeEach(async () => {
    const mockHistoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
    };

    const mockPredictedRepository = {
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwitterService,
        {
          provide: getRepositoryToken(TwitterHistory),
          useValue: mockHistoryRepository,
        },
        {
          provide: getRepositoryToken(TwitterPredicted),
          useValue: mockPredictedRepository,
        },
      ],
    }).compile();

    service = module.get<TwitterService>(TwitterService);
    historyRepository = module.get(getRepositoryToken(TwitterHistory));
    predictedRepository = module.get(getRepositoryToken(TwitterPredicted));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAnalysis', () => {
    it('should create a new Twitter analysis', async () => {
      // Arrange
      historyRepository.create.mockReturnValue(mockTwitterHistory);
      historyRepository.save.mockResolvedValue(mockTwitterHistory);

      // Act
      const result = await service.createAnalysis(mockUserId, mockCreateAnalysisDto);

      // Assert
      expect(historyRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        keyword: mockCreateAnalysisDto.keyword,
        sinceDate: new Date(mockCreateAnalysisDto.dateSince),
        untilDate: new Date(mockCreateAnalysisDto.dateUntil),
        status: AnalysisStatus.COLLECTING,
      });
      expect(historyRepository.save).toHaveBeenCalledWith(mockTwitterHistory);
      expect(result).toEqual(mockTwitterHistory);
    });
  });

  describe('findAllAnalyses', () => {
    it('should return paginated analyses', async () => {
      // Arrange
      const mockAnalyses = [mockTwitterHistory];
      const mockTotal = 1;
      historyRepository.findAndCount.mockResolvedValue([mockAnalyses, mockTotal]);

      // Act
      const result = await service.findAllAnalyses(1, 10);

      // Assert
      expect(historyRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['user'],
        order: { getDate: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        data: mockAnalyses,
        total: mockTotal,
      });
    });
  });

  describe('findUserAnalyses', () => {
    it('should return user-specific analyses', async () => {
      // Arrange
      const mockAnalyses = [mockTwitterHistory];
      const mockTotal = 1;
      historyRepository.findAndCount.mockResolvedValue([mockAnalyses, mockTotal]);

      // Act
      const result = await service.findUserAnalyses(mockUserId, 1, 10);

      // Assert
      expect(historyRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        relations: ['user'],
        order: { getDate: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        data: mockAnalyses,
        total: mockTotal,
      });
    });
  });

  describe('findOneAnalysis', () => {
    it('should return analysis when found and user has permission', async () => {
      // Arrange
      historyRepository.findOne.mockResolvedValue(mockTwitterHistory);

      // Act
      const result = await service.findOneAnalysis(mockAnalysisId, mockUserId);

      // Assert
      expect(historyRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAnalysisId },
        relations: ['user'],
      });
      expect(result).toEqual(mockTwitterHistory);
    });

    it('should throw NotFoundException when analysis not found', async () => {
      // Arrange
      historyRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOneAnalysis(mockAnalysisId)).rejects.toThrow(
        new NotFoundException(`Twitter analysis with ID "${mockAnalysisId}" not found`)
      );
    });

    it('should throw ForbiddenException when user does not own analysis', async () => {
      // Arrange
      const otherUserId = 'other-user-id';
      historyRepository.findOne.mockResolvedValue(mockTwitterHistory);

      // Act & Assert
      await expect(service.findOneAnalysis(mockAnalysisId, otherUserId)).rejects.toThrow(
        new ForbiddenException('You do not have permission to access this analysis')
      );
    });
  });

  describe('findAnalysisCount', () => {
    it('should return sentiment count for analysis', async () => {
      // Arrange
      historyRepository.findOne.mockResolvedValue(mockTwitterHistory);
      
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '10',
          positive: '5',
          neutral: '3',
          negative: '2',
        }),
      };
      
      predictedRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.findAnalysisCount(mockAnalysisId, mockUserId);

      // Assert
      expect(result).toEqual({
        total: 10,
        positive: 5,
        neutral: 3,
        negative: 2,
      });
    });
  });

  describe('updateAnalysisStatus', () => {
    it('should update analysis status', async () => {
      // Arrange
      historyRepository.findOne.mockResolvedValue(mockTwitterHistory);
      const updatedAnalysis = { ...mockTwitterHistory, status: AnalysisStatus.COMPLETED };
      historyRepository.save.mockResolvedValue(updatedAnalysis);

      // Act
      const result = await service.updateAnalysisStatus(mockAnalysisId, AnalysisStatus.COMPLETED);

      // Assert
      expect(historyRepository.save).toHaveBeenCalledWith({
        ...mockTwitterHistory,
        status: AnalysisStatus.COMPLETED,
      });
      expect(result.status).toBe(AnalysisStatus.COMPLETED);
    });
  });
});