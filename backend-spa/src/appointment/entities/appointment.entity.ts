// File: backend-spa/src/appointment/entities/appointment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { Treatment } from '../../treatment/entities/treatment.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: number;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: number;

  @ManyToOne(() => Treatment, { eager: true })
  @JoinColumn({ name: 'treatmentId' })
  treatment: Treatment;

  @Column()
  treatmentId: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDIENTE,
  })
  status: AppointmentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
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

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false }) // <-- ¡AÑADE ESTE CAMPO!
  reminderSent: boolean; // Para rastrear si el recordatorio ya fue enviado
}
