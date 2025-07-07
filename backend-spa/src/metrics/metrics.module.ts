// File: backend-spa/src/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa TypeOrmModule
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { Appointment } from '../appointment/entities/appointment.entity'; // Importa la entidad Appointment

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]), // <-- Añade esta línea
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
