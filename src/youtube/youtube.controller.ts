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
import { YoutubeService } from './youtube.service';
import { CreateYoutubeAnalysisDto } from './dto/create-youtube-analysis.dto';
import { CreateYoutubePredictionDto } from './dto/create-youtube-prediction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Post('analysis')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  createAnalysis(@Request() req, @Body() createAnalysisDto: CreateYoutubeAnalysisDto) {
    return this.youtubeService.createAnalysis(req.user.id, createAnalysisDto);
  }

  @Get('analysis')
  findAllAnalyses(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.youtubeService.findAllAnalyses(page, limit);
  }

  @Get('analysis/my')
  @UseGuards(JwtAuthGuard)
  findMyAnalyses(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.youtubeService.findUserAnalyses(req.user.id, page, limit);
  }

  @Get('analysis/:id')
  findOneAnalysis(@Param('id') id: string) {
    return this.youtubeService.findOneAnalysis(id);
  }

  @Get('analysis/:id/data')
  findAnalysisData(@Param('id') id: string) {
    return this.youtubeService.findAnalysisData(id);
  }

  @Get('analysis/:id/count')
  findAnalysisCount(@Param('id') id: string) {
    return this.youtubeService.findAnalysisCount(id);
  }

  @Get('analysis/:id/summary')
  findAnalysisSummary(@Param('id') id: string) {
    return this.youtubeService.findAnalysisSummary(id);
  }

  @Post('predictions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createPrediction(@Body() createPredictionDto: CreateYoutubePredictionDto) {
    return this.youtubeService.createPrediction(createPredictionDto);
  }

  @Get('topics')
  getAllTopics() {
    return this.youtubeService.getAllTopics();
  }
}