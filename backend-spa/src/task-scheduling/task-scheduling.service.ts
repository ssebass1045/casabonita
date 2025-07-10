// File: backend-spa/src/task-scheduling/task-scheduling.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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

  @Cron(CronExpression.EVERY_5_MINUTES) // Se ejecuta cada 5 minutos
  async handleAppointmentReminders() {
    this.logger.log('Ejecutando tarea de recordatorios de citas...');

    // Definir la ventana de tiempo: citas que comienzan entre 55 y 65 minutos desde ahora
    const now = new Date();
    const lowerBound = new Date(now.getTime() + 55 * 60 * 1000);
    const upperBound = new Date(now.getTime() + 65 * 60 * 1000);

    // Buscar citas que cumplan los criterios
    const appointmentsToSendReminder = await this.appointmentRepository.find({
      where: {
        startTime: Between(lowerBound, upperBound),
        status: AppointmentStatus.CONFIRMADA,
        reminderSent: false,
      },
      relations: ['client', 'treatment'], // Cargar relaciones necesarias
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

          // Marcar la cita como recordatorio enviado
          appointment.reminderSent = true;
          await this.appointmentRepository.save(appointment);
          this.logger.log(`Recordatorio enviado para la cita ID: ${appointment.id}`);

        } catch (error) {
          this.logger.error(`Error al enviar recordatorio para la cita ID: ${appointment.id}`, error);
        }
      } else {
        this.logger.warn(`La cita ID: ${appointment.id} no tiene un número de teléfono de cliente para enviar recordatorio.`);
      }
      if (appointmentsToSendReminder.length > 1) { // Solo añade la pausa si hay más de un mensaje que enviar
        this.logger.log('Pausando por 5 segundos para respetar el límite de tasa...');
        await delay(5000);
      }
    }
  }
}
