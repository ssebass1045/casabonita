// File: backend-spa/src/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Client } from '../client/entities/client.entity'; // <-- Importa la entidad Client
import { Employee } from '../employee/entities/employee.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Client, Employee]), // <-- Añade Client aquí
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
