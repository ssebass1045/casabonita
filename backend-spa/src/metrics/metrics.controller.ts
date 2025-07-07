// File: backend-spa/src/metrics/metrics.controller.ts
import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';

@UseGuards(AuthGuard('jwt')) // Protege todas las rutas de este controlador
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('income/monthly')
  async getMonthlyIncome(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<number> {
    return this.metricsService.getMonthlyIncome(year, month);
  }

  @Get('income/daily')
  async getDailyIncome(@Query('date') date: string): Promise<number> {
    return this.metricsService.getDailyIncome(date);
  }

  @Get('services/top')
  async getTopServices(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number): Promise<any[]> {
    return this.metricsService.getTopServices(limit);
  }

  // Puedes añadir más endpoints aquí para otras métricas
}
