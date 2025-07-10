// File: backend-spa/src/metrics/metrics.controller.ts
import { Controller, Get, Query, UseGuards, ParseIntPipe, ValidationPipe, Param, Logger } from '@nestjs/common'; // <-- ¡AÑADE Logger AQUÍ!
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';
import { IsNumber, Min, Max, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

class GetEmployeePayrollDto {
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsNumber({}, { message: 'La tasa de comisión debe ser un número.' })
  @Min(0, { message: 'La tasa de comisión no puede ser negativa.' })
  @Max(100, { message: 'La tasa de comisión no puede ser mayor a 100.' })
  @Transform(({ value }) => parseFloat(value))
  commissionRate: number;
}

@UseGuards(AuthGuard('jwt'))
@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

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

  @Get('appointments/status-counts')
  async getAppointmentStatusCounts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any[]> {
    return this.metricsService.getAppointmentStatusCounts(startDate, endDate);
  }

  @Get('clients/new-count')
  async getNewClientsCount(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<number> {
    return this.metricsService.getNewClientsCount(startDate, endDate);
  }

  @Get('employees/performance')
  async getEmployeePerformance(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any[]> {
    return this.metricsService.getEmployeePerformance(startDate, endDate);
  }

  @Get('employees/:employeeId/payroll')
  async getEmployeePayroll(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query(ValidationPipe) query: GetEmployeePayrollDto,
  ): Promise<any> {
    this.logger.log(`[Payroll] Request received for employeeId: ${employeeId}, startDate: ${query.startDate}, endDate: ${query.endDate}, commissionRate: ${query.commissionRate}`);
    // Pasa la tasa de comisión al servicio
    return this.metricsService.getEmployeePayroll(employeeId, query.startDate, query.endDate, query.commissionRate);
  }
}
