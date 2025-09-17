// File: backend-spa/src/task-scheduling/task-scheduling.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AppointmentStatus } from '../appointment/enums/appointment-status.enum';
import { WhatsappService } from '../whatsapp/whatsapp.service';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class TaskSchedulingService {
  private readonly logger = new Logger(TaskSchedulingService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private whatsappService: WhatsappService,
  ) {}

  // Se ejecuta todos los días a las 12:00 PM y 6:00 PM hora Colombia (America/Bogota)
  @Cron('0 12,18 * * *', {
    timeZone: 'America/Bogota',
  })
  async handleAppointmentReminders() {
    this.logger.log('Ejecutando tarea de recordatorios de citas...');

    const now = new Date();

    // Definir la ventana de tiempo: citas entre 23h55 y 24h05 desde ahora
    const lowerBound = new Date(now.getTime() + (23 * 60 + 55) * 60 * 1000);
    const upperBound = new Date(now.getTime() + (24 * 60 + 5) * 60 * 1000);

    const appointmentsToSendReminder = await this.appointmentRepository.find({
      where: {
        startTime: Between(lowerBound, upperBound),
        status: AppointmentStatus.CONFIRMADA,
        reminderSent: false,
      },
      relations: ['client', 'treatment'],
    });

    if (appointmentsToSendReminder.length === 0) {
      this.logger.log('No hay recordatorios de citas para enviar en este momento.');
      return;
    }

    this.logger.log(`Encontradas ${appointmentsToSendReminder.length} citas para enviar recordatorio.`);

    for (const appointment of appointmentsToSendReminder) {
      if (appointment.client?.phone) {
        try {
          await this.whatsappService.sendAppointmentReminder(
            appointment.client.phone,
            appointment.client.name,
            appointment.treatment.name,
            appointment.startTime,
          );

          appointment.reminderSent = true;
          await this.appointmentRepository.save(appointment);
          this.logger.log(`Recordatorio enviado para la cita ID: ${appointment.id}`);
        } catch (error) {
          this.logger.error(`Error al enviar recordatorio para la cita ID: ${appointment.id}`, error);
        }
      } else {
        this.logger.warn(`La cita ID: ${appointment.id} no tiene un número de teléfono de cliente para enviar recordatorio.`);
      }

      if (appointmentsToSendReminder.length > 1) {
        this.logger.log('Pausando por 5 segundos para respetar el límite de tasa...');
        await delay(5000);
      }
    }
  }
}
