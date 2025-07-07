// File: backend-spa/src/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AppointmentStatus } from '../appointment/enums/appointment-status.enum';
import { PaymentStatus } from '../appointment/enums/payment-status.enum';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  // Métricas de Ingresos
  async getMonthlyIncome(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1); // Meses en JS son 0-indexados
    const endDate = new Date(year, month, 0); // Último día del mes

    const result = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('SUM(appointment.price)', 'totalIncome')
      .where('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
      .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
      .andWhere('appointment.startTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne(); // getRawOne devuelve un objeto con las columnas seleccionadas

    return parseFloat(result?.totalIncome || 0);
  }

  async getDailyIncome(date: string): Promise<number> { // date en formato YYYY-MM-DD
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('SUM(appointment.price)', 'totalIncome')
      .where('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
      .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
      .andWhere('appointment.startTime BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
      .getRawOne();

    return parseFloat(result?.totalIncome || 0);
  }

  // Métricas de Servicios más Solicitados
  async getTopServices(limit: number = 5): Promise<any[]> {
    const result = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.treatment', 'treatment') // Une con la tabla de tratamientos
      .select('treatment.name', 'serviceName')
      .addSelect('COUNT(appointment.id)', 'count')
      .where('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
      .groupBy('treatment.name')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      serviceName: item.serviceName,
      count: parseInt(item.count, 10),
    }));
  }

  // Puedes añadir más métodos aquí para otras métricas
}

