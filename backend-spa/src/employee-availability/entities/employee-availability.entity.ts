// File: backend-spa/src/employee-availability/entities/employee-availability.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity'; // Importa la entidad Employee
import { DayOfWeek } from '../enums/day-of-week.enum'; // Importa el enum de días

@Entity()
export class EmployeeAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, { eager: true, onDelete: 'CASCADE' }) // Relación con Empleado, elimina disponibilidad si se elimina empleado
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: number; // Para almacenar el ID del empleado

  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek; // Día de la semana

  @Column({ type: 'time' }) // Hora de inicio del bloque de disponibilidad (ej. "09:00:00")
  startTime: string;

  @Column({ type: 'time' }) // Hora de fin del bloque de disponibilidad (ej. "17:00:00")
  endTime: string;

  @Column({ default: 1 }) // Número máximo de citas que puede tener a la vez (para la regla del estilista)
  maxAppointmentsAtOnce: number;

  // Puedes añadir un campo para fechas específicas de no disponibilidad si es necesario
  // @Column({ type: 'date', nullable: true })
  // specificDate?: Date;
}
