// File: backend-spa/src/appointment/appointment.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ClientService } from '../client/client.service';
import { EmployeeService } from '../employee/employee.service';
import { TreatmentService } from '../treatment/treatment.service';
import { EmployeeAvailabilityService } from '../employee-availability/employee-availability.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { DayOfWeek } from '../employee-availability/enums/day-of-week.enum';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private treatmentService: TreatmentService,
    private employeeAvailabilityService: EmployeeAvailabilityService,
    private whatsappService: WhatsappService,
  ) {}

  private async checkRelatedEntities(dto: CreateAppointmentDto | UpdateAppointmentDto) {
    if (dto.clientId) {
      await this.clientService.findOne(dto.clientId);
    }
    if (dto.employeeId) {
      await this.employeeService.findOne(dto.employeeId);
    }
    if (dto.treatmentId) {
      await this.treatmentService.findOne(dto.treatmentId);
    }
  }

  private async validateAppointmentTime(
    employeeId: number,
    startTime: Date,
    endTime: Date,
    appointmentIdToExclude?: number
  ): Promise<void> {
    const dayOfWeek = this.getDayOfWeekFromDate(startTime);
    const availabilities = await this.employeeAvailabilityService.findByEmployeeAndDay(employeeId, dayOfWeek);

    const appointmentStartTimeStr = startTime.toTimeString().substring(0, 5);
    const appointmentEndTimeStr = endTime.toTimeString().substring(0, 5);

    const relevantAvailability = availabilities.find(av => {
      return appointmentStartTimeStr >= av.startTime && appointmentEndTimeStr <= av.endTime;
    });

    if (!relevantAvailability) {
      throw new BadRequestException(`El empleado no está disponible en este horario (${dayOfWeek} de ${appointmentStartTimeStr} a ${appointmentEndTimeStr}).`);
    }

    let query = this.appointmentRepository.createQueryBuilder('appointment')
      .where('appointment.employeeId = :employeeId', { employeeId })
      .andWhere('appointment.status IN (:...activeStatuses)', { activeStatuses: [AppointmentStatus.PENDIENTE, AppointmentStatus.CONFIRMADA] })
      .andWhere(
        '(appointment.startTime < :endTime AND appointment.endTime > :startTime)',
        { startTime, endTime }
      );

    if (appointmentIdToExclude) {
      query = query.andWhere('appointment.id != :appointmentIdToExclude', { appointmentIdToExclude });
    }

    const overlappingAppointmentsCount = await query.getCount();

    if (overlappingAppointmentsCount >= relevantAvailability.maxAppointmentsAtOnce) {
      throw new BadRequestException(`El empleado ya tiene el máximo de citas (${relevantAvailability.maxAppointmentsAtOnce}) agendadas simultáneamente en este horario.`);
    }
  }

  private getDayOfWeekFromDate(date: Date): DayOfWeek {
    const days = [
      DayOfWeek.DOMINGO, DayOfWeek.LUNES, DayOfWeek.MARTES, DayOfWeek.MIERCOLES,
      DayOfWeek.JUEVES, DayOfWeek.VIERNES, DayOfWeek.SABADO
    ];
    return days[date.getDay()];
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    await this.checkRelatedEntities(createAppointmentDto);

    const startTime = new Date(createAppointmentDto.startTime);
    const endTime = new Date(createAppointmentDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
    }

    await this.validateAppointmentTime(
      createAppointmentDto.employeeId,
      startTime,
      endTime
    );

    if (createAppointmentDto.status === AppointmentStatus.REALIZADA && createAppointmentDto.paymentStatus !== PaymentStatus.PAGADO) {
      throw new BadRequestException('El estado de pago debe ser "Pagado" si el estado de la cita es "Realizada".');
    }

    const newAppointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      startTime,
      endTime,
    });
    const savedAppointment = await this.appointmentRepository.save(newAppointment);

    // Cargar relaciones para los mensajes
    const fullAppointment = await this.appointmentRepository.findOne({
        where: { id: savedAppointment.id },
        relations: ['client', 'employee', 'treatment']
    });

    if (fullAppointment) {
        // Notificación al empleado sobre la nueva cita (independientemente del estado inicial)
        if (fullAppointment.employee?.phone) {
            await this.whatsappService.sendNewAppointmentToEmployee(
                fullAppointment.employee.phone,
                fullAppointment.employee.name,
                fullAppointment.client?.name || 'Cliente Desconocido',
                fullAppointment.treatment?.name || 'Servicio Desconocido',
                fullAppointment.startTime,
                fullAppointment.status // Pasa el estado actual de la cita
            );
        }

        // Notificación de confirmación al cliente (SOLO si el estado es CONFIRMADA)
        if (fullAppointment.status === AppointmentStatus.CONFIRMADA && fullAppointment.client?.phone) {
            await this.whatsappService.sendAppointmentConfirmationToClient(
                fullAppointment.client.phone,
                fullAppointment.client.name,
                fullAppointment.employee.name,
                fullAppointment.treatment.name,
                fullAppointment.startTime
            );
        }
    }

    return savedAppointment;
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find();
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    return appointment;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    await this.checkRelatedEntities(updateAppointmentDto);

    const currentAppointment = await this.findOne(id);

    const newStartTime = updateAppointmentDto.startTime ? new Date(updateAppointmentDto.startTime) : currentAppointment.startTime;
    const newEndTime = updateAppointmentDto.endTime ? new Date(updateAppointmentDto.endTime) : currentAppointment.endTime;
    const newEmployeeId = updateAppointmentDto.employeeId ?? currentAppointment.employeeId;

    if (newStartTime >= newEndTime) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
    }

    await this.validateAppointmentTime(
      newEmployeeId,
      newStartTime,
      newEndTime,
      id
    );

    const newStatus = updateAppointmentDto.status ?? currentAppointment.status;
    const newPaymentStatus = updateAppointmentDto.paymentStatus ?? currentAppointment.paymentStatus;

    if (newStatus === AppointmentStatus.REALIZADA && newPaymentStatus !== PaymentStatus.PAGADO) {
      throw new BadRequestException('El estado de pago debe ser "Pagado" si el estado de la cita es "Realizada".');
    }

    const appointment = await this.appointmentRepository.preload({
      id: id,
      ...updateAppointmentDto,
      startTime: newStartTime,
      endTime: newEndTime,
    });
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada para actualizar`);
    }
    const updatedAppointment = await this.appointmentRepository.save(appointment);

    // Cargar relaciones para los mensajes
    const fullUpdatedAppointment = await this.appointmentRepository.findOne({
        where: { id: updatedAppointment.id },
        relations: ['client', 'employee', 'treatment']
    });

    if (fullUpdatedAppointment) {
        // Notificación de confirmación al cliente (si el estado CAMBIA a CONFIRMADA)
        if (newStatus === AppointmentStatus.CONFIRMADA && currentAppointment.status !== AppointmentStatus.CONFIRMADA && fullUpdatedAppointment.client?.phone) {
            await this.whatsappService.sendAppointmentConfirmationToClient(
                fullUpdatedAppointment.client.phone,
                fullUpdatedAppointment.client.name,
                fullUpdatedAppointment.employee.name,
                fullUpdatedAppointment.treatment.name,
                fullUpdatedAppointment.startTime
            );
        }

        // Notificación de cancelación al empleado (si el estado CAMBIA a CANCELADA)
        if (newStatus === AppointmentStatus.CANCELADA && currentAppointment.status !== AppointmentStatus.CANCELADA && fullUpdatedAppointment.employee?.phone) {
            await this.whatsappService.sendAppointmentCancellationToEmployee(
                fullUpdatedAppointment.employee.phone,
                fullUpdatedAppointment.employee.name,
                fullUpdatedAppointment.client?.name || 'Cliente Desconocido',
                fullUpdatedAppointment.treatment?.name || 'Servicio Desconocido',
                fullUpdatedAppointment.startTime
            );
        }

        // Notificación de actualización al empleado (si otros campos cambian y no es solo confirmación/cancelación)
        // Puedes refinar esta lógica para ser más específica sobre qué cambios notifican
        const hasTimeChanged = newStartTime.getTime() !== currentAppointment.startTime.getTime() || newEndTime.getTime() !== currentAppointment.endTime.getTime();
        const hasEmployeeChanged = newEmployeeId !== currentAppointment.employeeId;
        const hasStatusChangedButNotConfirmOrCancel = newStatus !== currentAppointment.status && newStatus !== AppointmentStatus.CONFIRMADA && newStatus !== AppointmentStatus.CANCELADA;

        if (fullUpdatedAppointment.employee?.phone && (hasTimeChanged || hasEmployeeChanged || hasStatusChangedButNotConfirmOrCancel)) {
            await this.whatsappService.sendAppointmentUpdateToEmployee(
                fullUpdatedAppointment.employee.phone,
                fullUpdatedAppointment.employee.name,
                fullUpdatedAppointment.client?.name || 'Cliente Desconocido',
                fullUpdatedAppointment.treatment?.name || 'Servicio Desconocido',
                fullUpdatedAppointment.startTime,
                fullUpdatedAppointment.status // Pasa el nuevo estado
            );
        }
    }

    return updatedAppointment;
  }

  async remove(id: number): Promise<void> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada para eliminar`);
    }
  }

  async findByClientId(clientId: number): Promise<Appointment[]> {
    await this.clientService.findOne(clientId);
    
    return this.appointmentRepository.find({
      where: { clientId },
      order: { startTime: 'DESC' },
    });
  }
}
