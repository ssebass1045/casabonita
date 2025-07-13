// File: backend-spa/src/metrics/metrics.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Client } from '../client/entities/client.entity'; // <-- Importa la entidad Client
import { Employee } from '../employee/entities/employee.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity'; // <-- Importa ProductSale
import { Product } from '../product/entities/product.entity';
import { AppointmentStatus } from '../appointment/enums/appointment-status.enum';
import { PaymentStatus } from '../appointment/enums/payment-status.enum';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Client) // <-- Inyecta el repositorio de Client
    private clientRepository: Repository<Client>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(ProductSale) // <-- Inyecta el repositorio de ProductSale
    private productSaleRepository: Repository<ProductSale>,
  ) {}

  // --- Métricas de Ingresos ---
  async getMonthlyIncome(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('SUM(appointment.price)', 'totalIncome')
      .where('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
      .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
      .andWhere('appointment.startTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return parseFloat(result?.totalIncome || 0);
  }

  async getDailyIncome(date: string): Promise<number> {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const result = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('SUM(appointment.price)', 'totalIncome')
      .where('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
      .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
      .andWhere('appointment.startTime BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
      .getRawOne();

    return parseFloat(result?.totalIncome || 0);
  }


  async getMonthlyIncomeTrend(): Promise<any[]> {
    const appointmentIncome = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select("TO_CHAR(appointment.startTime, 'YYYY-MM')", 'month')
      .addSelect('SUM(appointment.price)', 'income')
      .where('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
      .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    const productSalesIncome = await this.productSaleRepository
      .createQueryBuilder('productSale')
      .select("TO_CHAR(productSale.saleDate, 'YYYY-MM')", 'month')
      .addSelect('SUM(productSale.totalPrice)', 'income')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Combinar los ingresos de citas y ventas de productos
    const combinedIncome: { [key: string]: number } = {};

    appointmentIncome.forEach(item => {
      combinedIncome[item.month] = (combinedIncome[item.month] || 0) + parseFloat(item.income);
    });

    productSalesIncome.forEach(item => {
      combinedIncome[item.month] = (combinedIncome[item.month] || 0) + parseFloat(item.income);
    });

    // Convertir el objeto combinado a un array y ordenarlo
    return Object.keys(combinedIncome)
      .map(month => ({
        month,
        totalIncome: combinedIncome[month],
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }


  // --- Métricas de Servicios ---
  async getTopServices(limit: number = 5): Promise<any[]> {
    const result = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.treatment', 'treatment')
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

  // --- NUEVAS MÉTRICAS ---

  // Conteo de citas por estado
  async getAppointmentStatusCounts(startDate: string, endDate: string): Promise<any[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Incluir todo el día final

    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('appointment.status', 'status')
      .addSelect('COUNT(appointment.id)', 'count')
      .where('appointment.startTime BETWEEN :start AND :end', { start, end })
      .groupBy('appointment.status')
      .getRawMany();
  }

  // Conteo de nuevos clientes
  async getNewClientsCount(startDate: string, endDate: string): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    // Asumimos que la fecha de creación de un cliente se puede inferir de su primera cita
    // Una forma más robusta sería tener un campo `createdAt` en la entidad Client
    const firstAppointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('MIN(appointment.startTime)', 'firstAppointmentTime')
      .addSelect('appointment.clientId', 'clientId')
      .groupBy('appointment.clientId')
      .getRawMany();

    const newClientsInPeriod = firstAppointments.filter(app => {
      const firstTime = new Date(app.firstAppointmentTime);
      return firstTime >= start && firstTime < end;
    });

    return newClientsInPeriod.length;
  }

  // --- NUEVA MÉTRICA: Próximos Cumpleaños ---
  async getUpcomingBirthdays(days: number = 30): Promise<any[]> {
    // Esta consulta es específica de PostgreSQL para manejar cumpleaños que cruzan el fin de año
    const query = `
      SELECT
        id,
        name,
        "dateOfBirth",
        EXTRACT(DOY FROM "dateOfBirth") as birthday_doy,
        EXTRACT(DOY FROM CURRENT_DATE) as today_doy,
        (365 + EXTRACT(DOY FROM "dateOfBirth") - EXTRACT(DOY FROM CURRENT_DATE)) % 365 as days_until_birthday
      FROM
        client
      WHERE
        "dateOfBirth" IS NOT NULL
      ORDER BY
        days_until_birthday
      LIMIT $1;
    `;
    const clients = await this.clientRepository.query(query, [days]);

    return clients.map(client => ({
      id: client.id,
      name: client.name,
      dateOfBirth: new Date(client.dateOfBirth).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
      daysUntilBirthday: client.days_until_birthday,
    }));
  }

  // Rendimiento por empleado
  async getEmployeePerformance(startDate: string, endDate: string): Promise<any[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.employee', 'employee')
      .select('employee.name', 'employeeName')
      .addSelect('COUNT(appointment.id)', 'appointmentsCount')
      .addSelect('SUM(appointment.price)', 'totalIncome')
      .where('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
      .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
      .andWhere('appointment.startTime BETWEEN :start AND :end', { start, end })
      .groupBy('employee.id, employee.name')
      .orderBy('SUM(appointment.price)', 'DESC')
      .getRawMany();
  }

  async getProductSalesIncome(startDate: string, endDate: string): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    const result = await this.productSaleRepository
      .createQueryBuilder('productSale')
      .select('SUM(productSale.totalPrice)', 'totalSalesIncome')
      .where('productSale.saleDate BETWEEN :start AND :end', { start, end })
      .getRawOne();

    return parseFloat(result?.totalSalesIncome || 0);
  }

  // --- NUEVO MÉTODO: getDailyProductSalesIncome ---
  async getDailyProductSalesIncome(date: string): Promise<number> {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const result = await this.productSaleRepository
      .createQueryBuilder('productSale')
      .select('SUM(productSale.totalPrice)', 'totalSalesIncome')
      .where('productSale.saleDate BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
      .getRawOne();

    return parseFloat(result?.totalSalesIncome || 0);
  }

  async getTopSellingProducts(limit: number = 5): Promise<any[]> {
    const result = await this.productSaleRepository
      .createQueryBuilder('productSale')
      .leftJoinAndSelect('productSale.product', 'product') // Une con la tabla de productos
      .select('product.name', 'productName')
      .addSelect('SUM(productSale.quantity)', 'totalQuantitySold')
      .addSelect('SUM(productSale.totalPrice)', 'totalRevenue')
      .groupBy('product.name')
      .orderBy('SUM("productSale"."quantity")', 'DESC') // Ordenar por cantidad vendida
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      productName: item.productName,
      totalQuantitySold: parseInt(item.totalQuantitySold, 10),
      totalRevenue: parseFloat(item.totalRevenue),
    }));
  }


  async getEmployeePayroll(
    employeeId: number,
    startDate: string,
    endDate: string,
    commissionPercentage: number, // <-- Recibe el porcentaje (ej. 60)
  ): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${employeeId} no encontrado.`);
    }

    const result = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('SUM(appointment.price)', 'totalIncome')
      .addSelect('COUNT(appointment.id)', 'appointmentsCount')
      .where('appointment.employeeId = :employeeId', { employeeId })
      .andWhere('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
      .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
      .andWhere('appointment.startTime BETWEEN :start AND :end', { start, end })
      .getRawOne();

    const totalIncome = parseFloat(result?.totalIncome || 0);
    const appointmentsCount = parseInt(result?.appointmentsCount || 0, 10);
    const commissionRateAsDecimal = commissionPercentage / 100; // Convierte el porcentaje a decimal
    const payment = totalIncome * commissionRateAsDecimal;

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      startDate,
      endDate,
      totalIncome,
      appointmentsCount,
      commissionRate: commissionPercentage, // Devuelve el porcentaje original
      payment,
    };
  }

}
