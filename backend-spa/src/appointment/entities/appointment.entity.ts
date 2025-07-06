// File: backend-spa/src/appointment/entities/appointment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../client/entities/client.entity'; // Importa la entidad Client
import { Employee } from '../../employee/entities/employee.entity'; // Importa la entidad Employee
import { Treatment } from '../../treatment/entities/treatment.entity'; // Importa la entidad Treatment
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, { eager: true }) // Relación con Cliente, carga el cliente automáticamente
  @JoinColumn({ name: 'clientId' }) // Columna de la clave foránea
  client: Client;

  @Column()
  clientId: number; // Para almacenar el ID del cliente

  @ManyToOne(() => Employee, { eager: true }) // Relación con Empleado
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: number; // Para almacenar el ID del empleado

  @ManyToOne(() => Treatment, { eager: true }) // Relación con Tratamiento/Servicio
  @JoinColumn({ name: 'treatmentId' })
  treatment: Treatment;

  @Column()
  treatmentId: number; // Para almacenar el ID del tratamiento

  @Column({ type: 'timestamp' }) // Fecha y hora de inicio de la cita
  startTime: Date;

  @Column({ type: 'timestamp' }) // Fecha y hora de fin de la cita
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDIENTE,
  })
  status: AppointmentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) // Precio del servicio (modificable)
  price: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDIENTE,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true }) // Observaciones o notas de la cita
  notes: string;
}
