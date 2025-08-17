// File: backend-spa/src/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Client } from '../client/entities/client.entity';
import { Employee } from '../employee/entities/employee.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity'; // <-- Importa ProductSale
import { Product } from '../product/entities/product.entity'; // <-- Importa Product
import { DailyIncomeHistory } from './entities/daily-income-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Client,
      Employee,
      ProductSale,
      Product,
      DailyIncomeHistory
    ]), // <-- Añade ProductSale y Product aquí
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
