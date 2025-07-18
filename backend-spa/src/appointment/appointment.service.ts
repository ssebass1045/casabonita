// File: backend-spa/src/appointment/appointment.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
// --- ¡AÑADE ESTAS IMPORTACIONES! ---
import { GetAppointmentsDto, AppointmentSortBy, SortOrder } from './dto/get-appointments.dto';
// --- FIN DE LAS IMPORTACIONES A AÑADIR ---
import { ClientService } from '../client/client.service';
import { EmployeeService } from '../employee/employee.service';
import { TreatmentService } from '../treatment/treatment.service';
import { EmployeeAvailabilityService } from '../employee-availability/employee-availability.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { DayOfWeek } from '../employee-availability/enums/day-of-week.enum';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

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

    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23' // Formato 24h (00-23) para evitar errores de parseo
    };
    const appointmentStartTimeStr = new Intl.DateTimeFormat('es-CO', timeOptions).format(startTime);
    const appointmentEndTimeStr = new Intl.DateTimeFormat('es-CO', timeOptions).format(endTime);

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
    const zoneDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    return days[zoneDate.getDay()];
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

    const fullAppointment = await this.appointmentRepository.findOne({
        where: { id: savedAppointment.id },
        relations: ['client', 'employee', 'treatment']
    });

    if (fullAppointment) {
        // Notificación al empleado sobre la nueva cita (siempre es útil)
        if (fullAppointment.employee?.phone) {
            await this.whatsappService.sendNewAppointmentToEmployee(
                fullAppointment.employee.phone,
                fullAppointment.employee.name,
                fullAppointment.client?.name || 'Cliente Desconocido',
                fullAppointment.treatment?.name || 'Servicio Desconocido',
                fullAppointment.startTime,
                fullAppointment.status
            );
        }

        // Notificación al cliente SOLO si la cita se crea como "Confirmada"
        if (fullAppointment.status === AppointmentStatus.CONFIRMADA && fullAppointment.client?.phone) {
          this.logger.log(`Enviando confirmación de cita al cliente: ${fullAppointment.client.phone}`); 
          await delay(7000); // Retraso de 7 segundos
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

  async findAll(queryDto: GetAppointmentsDto): Promise<[Appointment[], number]> {
    const { page, limit, clientId, employeeId, status, paymentStatus, startDate, endDate, search, sortBy, sortOrder } = queryDto;

    const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.employee', 'employee')
      .leftJoinAndSelect('appointment.treatment', 'treatment');

    if (clientId) {
      queryBuilder.andWhere('appointment.clientId = :clientId', { clientId });
    }
    if (employeeId) {
      queryBuilder.andWhere('appointment.employeeId = :employeeId', { employeeId });
    }
    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }
    if (paymentStatus) {
      queryBuilder.andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus });
    }
    if (startDate) {
      queryBuilder.andWhere('appointment.startTime >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      queryBuilder.andWhere('appointment.startTime < :endDate', { endDate: endOfDay });
    }
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(client.name) LIKE :search OR LOWER(employee.name) LIKE :search OR LOWER(treatment.name) LIKE :search OR LOWER(appointment.notes) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }

    let orderByColumn: string;
    switch (sortBy) {
      case AppointmentSortBy.CLIENT_NAME:
        orderByColumn = 'client.name';
        break;
      case AppointmentSortBy.EMPLOYEE_NAME:
        orderByColumn = 'employee.name';
        break;
      case AppointmentSortBy.ID:
        orderByColumn = 'appointment.id';
        break;
      case AppointmentSortBy.START_TIME:
        orderByColumn = 'appointment.startTime';
        break;
      case AppointmentSortBy.STATUS:
        orderByColumn = 'appointment.status';
        break;
      case AppointmentSortBy.PRICE:
        orderByColumn = 'appointment.price';
        break;
      default:
        orderByColumn = 'appointment.startTime';
    }
    queryBuilder.orderBy(orderByColumn, sortOrder);

    const actualPage = page ?? 1;
    const actualLimit = limit ?? 10;
    queryBuilder.skip((actualPage - 1) * actualLimit).take(actualLimit);

    return queryBuilder.getManyAndCount();
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

        // Notificación de actualización al empleado (si otros campos cambian)
        const changes: string[] = [];
        if (newStartTime.getTime() !== currentAppointment.startTime.getTime() || newEndTime.getTime() !== currentAppointment.endTime.getTime()) {
            changes.push(`La nueva hora es ${newStartTime.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}`);
        }
        if (newEmployeeId !== currentAppointment.employeeId) {
            changes.push(`El nuevo profesional asignado es ${fullUpdatedAppointment.employee.name}`);
        }
        if (newStatus !== currentAppointment.status) {
            changes.push(`El nuevo estado es ${newStatus}`);
        }

        if (changes.length > 0 && fullUpdatedAppointment.employee?.phone) {
            // --- ¡CORRECCIÓN AQUÍ! ---
            if (newStatus === AppointmentStatus.CONFIRMADA && currentAppointment.status !== AppointmentStatus.CONFIRMADA) {
                this.logger.log('Esperando 7 segundos antes de enviar la actualización al empleado...');
                await delay(7000);
            }
            await this.whatsappService.sendAppointmentUpdateToEmployee(
                fullUpdatedAppointment.employee.phone,
                fullUpdatedAppointment.employee.name,
                fullUpdatedAppointment.client?.name || 'Cliente Desconocido',
                fullUpdatedAppointment.treatment?.name || 'Servicio Desconocido',
                fullUpdatedAppointment.startTime,
                changes // <-- Pasa el array de cambios, no el estado
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
