import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { CreateTwitterAnalysisDto } from './dto/create-twitter-analysis.dto';
import { CreateTwitterPredictionDto } from './dto/create-twitter-prediction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('twitter')
export class TwitterController {
  constructor(private readonly twitterService: TwitterService) {}

  // Protected route - only authenticated users can create analyses
  @Post('analysis')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  createAnalysis(@Request() req, @Body() createAnalysisDto: CreateTwitterAnalysisDto) {
    return this.twitterService.createAnalysis(req.user.id, createAnalysisDto);
  }

  // Public route - anyone can view all analyses
  @Get('analysis')
  findAllAnalyses(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.twitterService.findAllAnalyses(page, limit);
  }

  // Protected route - users can only see their own analyses
  @Get('analysis/my')
  @UseGuards(JwtAuthGuard)
  findMyAnalyses(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.twitterService.findUserAnalyses(req.user.id, page, limit);
  }

  // Public route - anyone can view specific analysis
  @Get('analysis/:id')
  findOneAnalysis(@Param('id') id: string) {
    return this.twitterService.findOneAnalysis(id);
  }

  // Public route - anyone can view analysis data
  @Get('analysis/:id/data')
  findAnalysisData(@Param('id') id: string) {
    return this.twitterService.findAnalysisData(id);
  }

  // Public route - anyone can view analysis count
  @Get('analysis/:id/count')
  findAnalysisCount(@Param('id') id: string) {
    return this.twitterService.findAnalysisCount(id);
  }

  // Public route - anyone can view analysis summary
  @Get('analysis/:id/summary')
  findAnalysisSummary(@Param('id') id: string) {
    return this.twitterService.findAnalysisSummary(id);
  }

  // Protected route - only for creating predictions (typically used by external services)
  @Post('predictions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createPrediction(@Body() createPredictionDto: CreateTwitterPredictionDto) {
    return this.twitterService.createPrediction(createPredictionDto);
  }

  // Public route - get all topics
  @Get('topics')
  getAllTopics() {
    return this.twitterService.getAllTopics();
  }
}