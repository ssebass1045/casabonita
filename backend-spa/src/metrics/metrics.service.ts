// File: backend-spa/src/metrics/metrics.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Client } from '../client/entities/client.entity'; // <-- Importa la entidad Client
import { Employee } from '../employee/entities/employee.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity'; // <-- Importa ProductSale
import { Product } from '../product/entities/product.entity';
import { AppointmentStatus } from '../appointment/enums/appointment-status.enum';
import { PaymentStatus } from '../appointment/enums/payment-status.enum';
import { DailyIncomeHistory } from './entities/daily-income-history.entity';
import { ServicesPackSession } from '../services-pack/entities/services-pack-session.entity';
import { toDate } from 'date-fns-tz';
import { format, subDays } from 'date-fns';
import { ClientServicesPack } from 'src/services-pack/entities/client-services-pack.entity';
import { ServicesPackSessionService } from 'src/services-pack/services-pack-session.service';
import { ServicesPackPayment } from '../services-pack/entities/services-pack-payment.entity';


@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Client) // <-- Inyecta el repositorio de Client
    private clientRepository: Repository<Client>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(ProductSale) // <-- Inyecta el repositorio de ProductSale
    private productSaleRepository: Repository<ProductSale>,
    @InjectRepository(DailyIncomeHistory) // <-- Inyecta el repositorio de DailyIncomeHistory
    private dailyIncomeHistoryRepository: Repository<DailyIncomeHistory>,
    @InjectRepository(ServicesPackSession) //
    private servicesPackSessionRepository: Repository<ServicesPackSession>,
    @InjectRepository(ClientServicesPack)
    private clientServicesPackRepository: Repository<ClientServicesPack>,
    private readonly sessionService: ServicesPackSessionService,
    @InjectRepository(ServicesPackPayment)
    private readonly packPaymentRepository: Repository<ServicesPackPayment>,
  ) {}

  // --- NUEVA FUNCIÓN DE TAREA PROGRAMADA (VERSIÓN CORREGIDA) ---
  @Cron('0 1 * * *', {
    name: 'saveDailyIncomeHistory',
    timeZone: 'America/Bogota', // Tu zona horaria
  })
  async handleCron() {
    this.logger.log('Ejecutando tarea programada: Guardar historial de ingresos diarios.');

    // La opción timeZone del @Cron asegura que este código se ejecute a la 1 AM local.
    // A esa hora, `new Date()` ya corresponde al nuevo día, por lo que podemos
    // restar un día de forma segura para obtener la fecha del día que acaba de terminar.
    const today = new Date();
    const yesterday = subDays(today, 1);
    const dateToSave = format(yesterday, 'yyyy-MM-dd');

    this.logger.log(`Calculando y guardando ingresos para la fecha: ${dateToSave}`);

    try {
      await this.calculateAndSaveDailyIncome(dateToSave);
      this.logger.log(`Historial de ingresos para la fecha ${dateToSave} guardado exitosamente.`);
    } catch (error) {
      this.logger.error(`Error al guardar el historial de ingresos para la fecha ${dateToSave}`, error.stack);
    }
  }

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
 const start = new Date(`${date}T00:00:00-05:00`);
    const end = new Date(`${date}T23:59:59.999-05:00`);

  const result = await this.appointmentRepository
    .createQueryBuilder('appointment')
    .select('SUM(appointment.price)', 'totalIncome')
    .where('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
    .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
    .andWhere('appointment.startTime BETWEEN :start AND :end', { start, end })
    .getRawOne();

  return parseFloat(result?.totalIncome || 0);
}


  // --- NUEVOS MÉTODOS PARA EL HISTORIAL DE INGRESOS ---

  /**
   * Obtiene el historial de ingresos de un día específico desde la tabla de historial.
   * @param date La fecha a consultar en formato 'YYYY-MM-DD'.
   */
  async getHistoricalDailyIncome(date: string): Promise<DailyIncomeHistory | null> {
    return this.dailyIncomeHistoryRepository.findOne({ where: { date } });
  }

  /**
   * Calcula los ingresos de citas y productos para una fecha dada y los guarda
   * o actualiza en la tabla de historial.
   * @param date La fecha a calcular y guardar en formato 'YYYY-MM-DD'.
   */
  async calculateAndSaveDailyIncome(date: string): Promise<DailyIncomeHistory> {
    const appointmentIncome = await this.getDailyIncome(date);
    const productSalesIncome = await this.getDailyProductSalesIncome(date);
    const totalIncome = appointmentIncome + productSalesIncome;

    // Busca si ya existe un registro para esa fecha
    let historyEntry = await this.dailyIncomeHistoryRepository.findOne({ where: { date } });

    if (historyEntry) {
      // Si existe, lo actualiza
      historyEntry.appointmentIncome = appointmentIncome;
      historyEntry.productSalesIncome = productSalesIncome;
      historyEntry.totalIncome = totalIncome;
    } else {
      // Si no existe, crea uno nuevo
      historyEntry = this.dailyIncomeHistoryRepository.create({
        date,
        appointmentIncome,
        productSalesIncome,
        totalIncome,
      });
    }

    return this.dailyIncomeHistoryRepository.save(historyEntry);
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
    const start = new Date(`${startDate}T00:00:00-05:00`);
    const end = new Date(`${endDate}T23:59:59.999-05:00`);

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
  const start = new Date(`${startDate}T00:00:00-05:00`);
  const end = new Date(`${endDate}T23:59:59.999-05:00`);

  // Esta consulta necesita ajustarse para usar las fechas en la zona correcta
  const firstAppointments = await this.appointmentRepository
    .createQueryBuilder('appointment')
    .select('MIN(appointment.startTime)', 'firstAppointmentTime')
    .addSelect('appointment.clientId', 'clientId')
    .where('appointment.startTime BETWEEN :start AND :end', { start, end }) // ← AÑADIR este filtro
    .groupBy('appointment.clientId')
    .getRawMany();

  return firstAppointments.length; // ← Simplificado
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
    const start = new Date(`${startDate}T00:00:00-05:00`);
    const end = new Date(`${endDate}T23:59:59.999-05:00`);

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
    const start = new Date(`${startDate}T00:00:00-05:00`);
    const end = new Date(`${endDate}T23:59:59.999-05:00`);


    const result = await this.productSaleRepository
      .createQueryBuilder('productSale')
      .select('SUM(productSale.totalPrice)', 'totalSalesIncome')
      .where('productSale.saleDate BETWEEN :start AND :end', { start, end })
      .getRawOne();

    return parseFloat(result?.totalSalesIncome || 0);
  }

  // --- NUEVO MÉTODO: getDailyProductSalesIncome ---
  async getDailyProductSalesIncome(date: string): Promise<number> {
  const start = new Date(`${date}T00:00:00-05:00`);
    const end = new Date(`${date}T23:59:59.999-05:00`);


  const result = await this.productSaleRepository
    .createQueryBuilder('productSale')
    .select('SUM(productSale.totalPrice)', 'totalSalesIncome')
    .where('productSale.saleDate BETWEEN :start AND :end', { start, end })
    .getRawOne();

  return parseFloat(result?.totalSalesIncome || 0);
}

  // --- NUEVOS MÉTODOS PARA DESGLOSE POR MÉTODO DE PAGO ---
  
  async getDailyIncomeByPaymentMethod(date: string): Promise<any> {
  const start = new Date(`${date}T00:00:00-05:00`);
  const end = new Date(`${date}T23:59:59.999-05:00`);


  // Ingresos de citas por método de pago
  const appointmentsByMethod = await this.appointmentRepository
    .createQueryBuilder('appointment')
    .select('appointment.paymentMethod', 'paymentMethod')
    .addSelect('SUM(appointment.price)', 'total')
    .where('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
    .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
    .andWhere('appointment.startTime BETWEEN :start AND :end', { start, end })
    .groupBy('appointment.paymentMethod')
    .getRawMany();

  // Ingresos de productos por método de pago
  const productSalesByMethod = await this.productSaleRepository
    .createQueryBuilder('productSale')
    .select('productSale.paymentMethod', 'paymentMethod')
    .addSelect('SUM(productSale.totalPrice)', 'total')
    .where('productSale.saleDate BETWEEN :start AND :end', { start, end })
    .groupBy('productSale.paymentMethod')
    .getRawMany();

  // Ingresos de compras iniciales de paquetes
  const servicesPacksByMethod = await this.clientServicesPackRepository
    .createQueryBuilder('pack')
    .select('pack.paymentMethod', 'paymentMethod')
    .addSelect('SUM(pack.amountPaid)', 'total')
    .where('pack.purchaseDate BETWEEN :start AND :end', { start, end })
    .groupBy('pack.paymentMethod')
    .getRawMany();

  // Ingresos de pagos adicionales a paquetes
  const packAdditionalPayments = await this.packPaymentRepository
    .createQueryBuilder('payment')
    .select('payment.paymentMethod', 'paymentMethod')
    .addSelect('SUM(payment.amount)', 'total')
    .where('payment.paymentDate BETWEEN :start AND :end', { start, end })
    .groupBy('payment.paymentMethod')
    .getRawMany();

  // Combinar ambos resultados de paquetes
  const combinedPackResults: { [key: string]: number } = {};

  // Sumar compras iniciales
  servicesPacksByMethod.forEach(item => {
    combinedPackResults[item.paymentMethod] = (combinedPackResults[item.paymentMethod] || 0) + parseFloat(item.total || 0);
  });

  // Sumar pagos adicionales
  packAdditionalPayments.forEach(item => {
    combinedPackResults[item.paymentMethod] = (combinedPackResults[item.paymentMethod] || 0) + parseFloat(item.total || 0);
  });

  // Combinar todos los resultados
  const combinedResults: { [key: string]: number } = {};
  
  // Inicializar con 0 para todos los métodos de pago
  combinedResults['Efectivo'] = 0;
  combinedResults['Transferencia'] = 0;
  combinedResults['Tarjeta'] = 0;
  combinedResults['Otro'] = 0;

  // Sumar ingresos de citas
  appointmentsByMethod.forEach(item => {
    combinedResults[item.paymentMethod] = (combinedResults[item.paymentMethod] || 0) + parseFloat(item.total || 0);
  });

  // Sumar ingresos de productos
  productSalesByMethod.forEach(item => {
    combinedResults[item.paymentMethod] = (combinedResults[item.paymentMethod] || 0) + parseFloat(item.total || 0);
  });

  // Sumar ingresos de paquetes (compras iniciales + pagos adicionales)
  Object.keys(combinedPackResults).forEach(paymentMethod => {
    combinedResults[paymentMethod] = (combinedResults[paymentMethod] || 0) + combinedPackResults[paymentMethod];
  });

  // Calcular totales
  const totalAppointments = appointmentsByMethod.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  const totalProducts = productSalesByMethod.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  const totalPacks = Object.values(combinedPackResults).reduce((sum, amount) => sum + amount, 0);
  const grandTotal = totalAppointments + totalProducts + totalPacks;

  return {
    byPaymentMethod: combinedResults,
    totals: {
      appointments: totalAppointments,
      products: totalProducts,
      packs: totalPacks,
      total: grandTotal
    }
  };
}

  async getDailyProductSalesList(date: string): Promise<any[]> {
    const start = new Date(`${date}T00:00:00-05:00`);
    const end = new Date(`${date}T23:59:59.999-05:00`);


    const sales = await this.productSaleRepository
      .createQueryBuilder('productSale')
      .leftJoinAndSelect('productSale.product', 'product')
      .where('productSale.saleDate BETWEEN :start AND :end', { start, end })
      .orderBy('productSale.saleDate', 'DESC')
      .getMany();

    return sales.map(sale => ({
      id: sale.id,
      productName: sale.product.name,
      quantity: sale.quantity,
      pricePerUnit: parseFloat(sale.pricePerUnit.toString()),
      totalPrice: parseFloat(sale.totalPrice.toString()),
      paymentMethod: sale.paymentMethod,
      saleDate: sale.saleDate
    }));
  }

  async getMonthlyProductSalesList(year: number, month: number): Promise<any[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  // Ajustar para usar zona horaria
  startDate.setHours(startDate.getHours() - 5); // Ajustar a UTC-5
  endDate.setHours(endDate.getHours() - 5); // Ajustar a UTC-5

  const sales = await this.productSaleRepository
    .createQueryBuilder('productSale')
    .leftJoinAndSelect('productSale.product', 'product')
    .where('productSale.saleDate BETWEEN :startDate AND :endDate', { startDate, endDate })
    .orderBy('productSale.saleDate', 'DESC')
    .getMany();

  return sales.map(sale => ({
    id: sale.id,
    productName: sale.product.name,
    quantity: sale.quantity,
    pricePerUnit: parseFloat(sale.pricePerUnit.toString()),
    totalPrice: parseFloat(sale.totalPrice.toString()),
    paymentMethod: sale.paymentMethod,
    saleDate: sale.saleDate
  }));
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
  commissionPercentage: number,
): Promise<any> {
  // Ajustar zonas horarias como en otros métodos
  const start = new Date(`${startDate}T00:00:00-05:00`);
    const end = new Date(`${endDate}T23:59:59.999-05:00`);

  const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
  if (!employee) {
    throw new NotFoundException(`Empleado con ID ${employeeId} no encontrado.`);
  }

  // Cálculo de citas normales (existente)
  const result = await this.appointmentRepository
    .createQueryBuilder('appointment')
    .select('SUM(appointment.price)', 'totalIncome')
    .addSelect('COUNT(appointment.id)', 'appointmentsCount')
    .where('appointment.employeeId = :employeeId', { employeeId })
    .andWhere('appointment.status = :status', { status: AppointmentStatus.REALIZADA })
    .andWhere('appointment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAGADO })
    .andWhere('appointment.startTime BETWEEN :start AND :end', { start, end })
    .getRawOne();

  // NUEVO: Cálculo de sesiones de paquetes
  const packSessions = await this.servicesPackSessionRepository
    .createQueryBuilder('session')
    .select('SUM(session.employeePayment)', 'totalPackPayment')
    .addSelect('COUNT(session.id)', 'packSessionsCount')
    .where('session.employeeId = :employeeId', { employeeId })
    .andWhere('session.sessionDate BETWEEN :start AND :end', { start, end })
    .getRawOne();

  const totalIncome = parseFloat(result?.totalIncome || 0);
  const appointmentsCount = parseInt(result?.appointmentsCount || 0, 10);
  const totalPackPayment = parseFloat(packSessions?.totalPackPayment || 0);
  const packSessionsCount = parseInt(packSessions?.packSessionsCount || 0, 10);

  const commissionRateAsDecimal = commissionPercentage / 100;
  const appointmentPayment = totalIncome * commissionRateAsDecimal;
  const totalPayment = appointmentPayment + totalPackPayment;

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    startDate,
    endDate,
    totalIncome,
    appointmentsCount,
    commissionRate: commissionPercentage,
    appointmentPayment,
    packSessionsCount,
    totalPackPayment,
    totalPayment,
  };
}

}