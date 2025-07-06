// File: backend-spa/src/appointment/appointment.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { ClientService } from '../client/client.service';
import { EmployeeService } from '../employee/employee.service';
import { TreatmentService } from '../treatment/treatment.service';
import { EmployeeAvailabilityService } from '../employee-availability/employee-availability.service'; // <-- Importa el servicio de disponibilidad
import { AppointmentStatus } from './enums/appointment-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { DayOfWeek } from '../employee-availability/enums/day-of-week.enum'; // <-- Importa el enum DayOfWeek

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private treatmentService: TreatmentService,
    private employeeAvailabilityService: EmployeeAvailabilityService, // <-- Inyecta el servicio de disponibilidad
  ) {}

  // Helper para verificar existencias de entidades relacionadas
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

  // --- NUEVA FUNCIÓN: Validar Disponibilidad y Solapamiento ---
  private async validateAppointmentTime(
    employeeId: number,
    startTime: Date,
    endTime: Date,
    appointmentIdToExclude?: number // Para edición, excluimos la propia cita
  ): Promise<void> {
    // 1. Obtener el día de la semana de la cita
    const dayOfWeek = this.getDayOfWeekFromDate(startTime);

    // 2. Obtener la disponibilidad del empleado para ese día
    const availabilities = await this.employeeAvailabilityService.findByEmployeeAndDay(employeeId, dayOfWeek);

    // Convertir Date a HH:MM para comparación con la disponibilidad
    const appointmentStartTimeStr = startTime.toTimeString().substring(0, 5);
    const appointmentEndTimeStr = endTime.toTimeString().substring(0, 5);

    // Encontrar un bloque de disponibilidad que contenga la cita
    const relevantAvailability = availabilities.find(av => {
      // Comprobar si la cita cae dentro del bloque de disponibilidad
      return appointmentStartTimeStr >= av.startTime && appointmentEndTimeStr <= av.endTime;
    });

    if (!relevantAvailability) {
      throw new BadRequestException(`El empleado no está disponible en este horario (${dayOfWeek} de ${appointmentStartTimeStr} a ${appointmentEndTimeStr}).`);
    }

    // 3. Contar citas existentes que se solapan
    let query = this.appointmentRepository.createQueryBuilder('appointment')
      .where('appointment.employeeId = :employeeId', { employeeId })
      .andWhere('appointment.status IN (:...activeStatuses)', { activeStatuses: [AppointmentStatus.PENDIENTE, AppointmentStatus.CONFIRMADA] }) // Solo citas activas
      .andWhere(
        '(appointment.startTime < :endTime AND appointment.endTime > :startTime)',
        { startTime, endTime }
      );

    if (appointmentIdToExclude) {
      query = query.andWhere('appointment.id != :appointmentIdToExclude', { appointmentIdToExclude });
    }

    const overlappingAppointmentsCount = await query.getCount();

    // 4. Verificar maxAppointmentsAtOnce
    if (overlappingAppointmentsCount >= relevantAvailability.maxAppointmentsAtOnce) {
      throw new BadRequestException(`El empleado ya tiene el máximo de citas (${relevantAvailability.maxAppointmentsAtOnce}) agendadas simultáneamente en este horario.`);
    }
  }

  // Helper para obtener el día de la semana en formato de enum
  private getDayOfWeekFromDate(date: Date): DayOfWeek {
    const days = [
      DayOfWeek.DOMINGO, DayOfWeek.LUNES, DayOfWeek.MARTES, DayOfWeek.MIERCOLES,
      DayOfWeek.JUEVES, DayOfWeek.VIERNES, DayOfWeek.SABADO
    ];
    return days[date.getDay()];
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    await this.checkRelatedEntities(createAppointmentDto);

    // Convertir strings de fecha/hora a objetos Date
    const startTime = new Date(createAppointmentDto.startTime);
    const endTime = new Date(createAppointmentDto.endTime);

    // Validar que la hora de inicio sea anterior a la hora de fin
    if (startTime >= endTime) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
    }

    // Validar disponibilidad y solapamiento
    await this.validateAppointmentTime(
      createAppointmentDto.employeeId,
      startTime,
      endTime
    );

    // Regla de negocio: Si el estado es 'Realizada', el pago debe ser 'Pagado'
    if (createAppointmentDto.status === AppointmentStatus.REALIZADA && createAppointmentDto.paymentStatus !== PaymentStatus.PAGADO) {
      throw new BadRequestException('El estado de pago debe ser "Pagado" si el estado de la cita es "Realizada".');
    }

    const newAppointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      startTime, // Guardar como objeto Date
      endTime,   // Guardar como objeto Date
    });
    return this.appointmentRepository.save(newAppointment);
  }

  async findAll(): Promise<Appointment[]> {
    // Cargar relaciones eager (ya configurado en la entidad)
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

    const currentAppointment = await this.findOne(id); // Obtener la cita actual para comparar

    // Convertir strings de fecha/hora a objetos Date (si se proporcionan en el DTO)
    const newStartTime = updateAppointmentDto.startTime ? new Date(updateAppointmentDto.startTime) : currentAppointment.startTime;
    const newEndTime = updateAppointmentDto.endTime ? new Date(updateAppointmentDto.endTime) : currentAppointment.endTime;
    const newEmployeeId = updateAppointmentDto.employeeId ?? currentAppointment.employeeId;

    // Validar que la hora de inicio sea anterior a la hora de fin
    if (newStartTime >= newEndTime) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
    }

    // Validar disponibilidad y solapamiento (excluyendo la propia cita si no se cambia el empleado/hora)
    await this.validateAppointmentTime(
      newEmployeeId,
      newStartTime,
      newEndTime,
      id // Excluir la cita actual de la comprobación de solapamiento
    );

    // Regla de negocio: Si el estado es 'Realizada', el pago debe ser 'Pagado'
    const newStatus = updateAppointmentDto.status ?? currentAppointment.status;
    const newPaymentStatus = updateAppointmentDto.paymentStatus ?? currentAppointment.paymentStatus;

    if (newStatus === AppointmentStatus.REALIZADA && newPaymentStatus !== PaymentStatus.PAGADO) {
      throw new BadRequestException('El estado de pago debe ser "Pagado" si el estado de la cita es "Realizada".');
    }

    const appointment = await this.appointmentRepository.preload({
      id: id,
      ...updateAppointmentDto,
      startTime: newStartTime, // Guardar como objeto Date
      endTime: newEndTime,     // Guardar como objeto Date
    });
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada para actualizar`);
    }
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada para eliminar`);
    }
  }
}
