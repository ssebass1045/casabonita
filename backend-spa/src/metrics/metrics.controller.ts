// File: backend-spa/src/metrics/metrics.controller.ts
import { Controller, Get, Query, UseGuards, ParseIntPipe, ValidationPipe, Param, Logger } from '@nestjs/common'; // <-- ¡AÑADE Logger AQUÍ!
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';
import { IsNumber, Min, Max, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { Roles } from '../auth/decorators/roles.decorator'; // <-- Importa el decorador
import { UserRole } from '../user/entities/user.entity'; // <-- Importa el enum
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- Importa el guardia


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
//@Roles(UserRole.ADMIN)
@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(private readonly metricsService: MetricsService) {}

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('income/monthly')
  @Roles(UserRole.ADMIN)
  async getMonthlyIncome(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<number> {
    return this.metricsService.getMonthlyIncome(year, month);
  }

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('income/daily')
  @Roles(UserRole.ADMIN)
  async getDailyIncome(@Query('date') date: string): Promise<number> {
    return this.metricsService.getDailyIncome(date);
  }

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('services/top')
  @Roles(UserRole.ADMIN)
  async getTopServices(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number): Promise<any[]> {
    return this.metricsService.getTopServices(limit);
  }

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('appointments/status-counts')
  @Roles(UserRole.ADMIN)
  async getAppointmentStatusCounts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any[]> {
    return this.metricsService.getAppointmentStatusCounts(startDate, endDate);
  }

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('clients/new-count')
  @Roles(UserRole.ADMIN)
  async getNewClientsCount(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<number> {
    return this.metricsService.getNewClientsCount(startDate, endDate);
  }

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('employees/performance')
  @Roles(UserRole.ADMIN)
  async getEmployeePerformance(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any[]> {
    return this.metricsService.getEmployeePerformance(startDate, endDate);
  }

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('employees/:employeeId/payroll')
  @Roles(UserRole.ADMIN)
  async getEmployeePayroll(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query(ValidationPipe) query: GetEmployeePayrollDto,
  ): Promise<any> {
    this.logger.log(`[Payroll] Request received for employeeId: ${employeeId}, startDate: ${query.startDate}, endDate: ${query.endDate}, commissionRate: ${query.commissionRate}`);
    // Pasa la tasa de comisión al servicio
    return this.metricsService.getEmployeePayroll(employeeId, query.startDate, query.endDate, query.commissionRate);
  }
  @Get('products/sales-income')
  @Roles(UserRole.ADMIN) // Solo ADMIN puede ver estas métricas
  async getProductSalesIncome(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<number> {
    return this.metricsService.getProductSalesIncome(startDate, endDate);
  }

  // --- NUEVO ENDPOINT: getDailyProductSalesIncome ---
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
  @Roles(UserRole.ADMIN) // Solo ADMIN puede ver estas métricas
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
}
