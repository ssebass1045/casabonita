// File: backend-spa/src/task-scheduling/task-scheduling.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskSchedulingService } from './task-scheduling.service';
import { Appointment } from '../appointment/entities/appointment.entity';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]), // Importa el repositorio de Appointment
    WhatsappModule, // Importa el módulo de WhatsApp para usar el servicio
  ],
  providers: [TaskSchedulingService],
})
export class TaskSchedulingModule {}
