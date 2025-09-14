// File: backend-spa/src/metrics/metrics.controller.ts
import { Controller, Get, Query, UseGuards, ParseIntPipe, ValidationPipe, Param, Logger, Post, Body } from '@nestjs/common'; // <-- AÑADE Post y Body
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';
import { IsNumber, Min, Max, IsString, IsNotEmpty, IsDateString } from 'class-validator'; // <-- AÑADE IsDateString
import { Transform } from 'class-transformer';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DailyIncomeHistory } from './entities/daily-income-history.entity'; // <-- AÑADE ESTA LÍNEA

// DTO para el endpoint de guardar historial
class SaveDailyIncomeDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;
}

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

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(private readonly metricsService: MetricsService) {}

  // --- ENDPOINTS DE INGRESOS ---

  @Get('income/monthly')
  @Roles(UserRole.ADMIN)
  async getMonthlyIncome(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<number> {
    return this.metricsService.getMonthlyIncome(year, month);
  }

  @Get('income/daily')
  @Roles(UserRole.ADMIN)
  async getDailyIncome(@Query('date') date: string): Promise<number> {
    return this.metricsService.getDailyIncome(date);
  }

  // --- NUEVOS ENDPOINTS PARA EL HISTORIAL ---

  @Get('income/historical')
  @Roles(UserRole.ADMIN)
  async getHistoricalDailyIncome(@Query('date') date: string): Promise<DailyIncomeHistory | null> {
    this.logger.log(`[Historical Income] Request received for date: ${date}`);
    return this.metricsService.getHistoricalDailyIncome(date);
  }

  @Post('income/save-daily')
  @Roles(UserRole.ADMIN)
  async saveDailyIncome(@Body(ValidationPipe) body: SaveDailyIncomeDto): Promise<DailyIncomeHistory> {
    this.logger.log(`[Save Daily Income] Request received for date: ${body.date}`);
    return this.metricsService.calculateAndSaveDailyIncome(body.date);
  }

  // --- OTROS ENDPOINTS DE MÉTRICAS ---

  @Get('services/top')
  @Roles(UserRole.ADMIN)
  async getTopServices(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number): Promise<any[]> {
    return this.metricsService.getTopServices(limit);
  }

  @Get('appointments/status-counts')
  @Roles(UserRole.ADMIN)
  async getAppointmentStatusCounts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any[]> {
    return this.metricsService.getAppointmentStatusCounts(startDate, endDate);
  }

  @Get('clients/new-count')
  @Roles(UserRole.ADMIN)
  async getNewClientsCount(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<number> {
    return this.metricsService.getNewClientsCount(startDate, endDate);
  }

  @Get('employees/performance')
  @Roles(UserRole.ADMIN)
  async getEmployeePerformance(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any[]> {
    return this.metricsService.getEmployeePerformance(startDate, endDate);
  }

  @Get('employees/:employeeId/payroll')
  @Roles(UserRole.ADMIN)
  async getEmployeePayroll(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query(ValidationPipe) query: GetEmployeePayrollDto,
  ): Promise<any> {
    this.logger.log(`[Payroll] Request received for employeeId: ${employeeId}, startDate: ${query.startDate}, endDate: ${query.endDate}, commissionRate: ${query.commissionRate}`);
    return this.metricsService.getEmployeePayroll(employeeId, query.startDate, query.endDate, query.commissionRate);
  }
  @Get('products/sales-income')
  @Roles(UserRole.ADMIN)
  async getProductSalesIncome(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<number> {
    return this.metricsService.getProductSalesIncome(startDate, endDate);
  }

  @Get('products/sales-income/daily')
  @Roles(UserRole.ADMIN)
  async getDailyProductSalesIncome(@Query('date') date: string): Promise<number> {
    return this.metricsService.getDailyProductSalesIncome(date);
  }

  @Get('clients/upcoming-birthdays')
  @Roles(UserRole.ADMIN)
  async getUpcomingBirthdays(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number
  ): Promise<any[]> {
    return this.metricsService.getUpcomingBirthdays(days);
  }

  @Get('products/top-selling')
  @Roles(UserRole.ADMIN)
  async getTopSellingProducts(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<any[]> {
    return this.metricsService.getTopSellingProducts(limit);
  }

  @Get('income/monthly-trend')
  @Roles(UserRole.ADMIN)
  async getMonthlyIncomeTrend(): Promise<any[]> {
    return this.metricsService.getMonthlyIncomeTrend();
  }

    // --- NUEVOS ENDPOINTS PARA DESGLOSE POR MÉTODO DE PAGO Y LISTADO DE VENTAS ---
  
  @Get('income/daily-by-payment-method')
  @Roles(UserRole.ADMIN)
  async getDailyIncomeByPaymentMethod(@Query('date') date: string): Promise<any> {
    this.logger.log(`[Daily Income by Payment Method] Request received for date: ${date}`);
    return this.metricsService.getDailyIncomeByPaymentMethod(date);
  }

  @Get('products/daily-sales-list')
  @Roles(UserRole.ADMIN)
  async getDailyProductSalesList(@Query('date') date: string): Promise<any[]> {
    this.logger.log(`[Daily Product Sales List] Request received for date: ${date}`);
    return this.metricsService.getDailyProductSalesList(date);
  }

  @Get('products/monthly-sales-list')
  @Roles(UserRole.ADMIN)
  async getMonthlyProductSalesList(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<any[]> {
    this.logger.log(`[Monthly Product Sales List] Request received for year: ${year}, month: ${month}`);
    return this.metricsService.getMonthlyProductSalesList(year, month);
  }

}
