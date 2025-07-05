// File: backend-spa/src/employee/entities/employee.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { EmployeeSpecialty } from '../enums/employee-specialty.enum'; // <-- Importa el enum

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum', // <-- Especifica el tipo 'enum' para TypeORM
    enum: EmployeeSpecialty, // <-- Referencia al enum que creamos
    nullable: true,
  })
  specialty: EmployeeSpecialty; // <-- Usa el tipo EmployeeSpecialty del enum

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  imageUrl: string;
}
