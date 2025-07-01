// File: backend-spa/src/employee/entities/employee.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true }) // Por ejemplo: "Estilista", "Dermatólogo", "Masajista"
  specialty: string;

  @Column({ type: 'text', nullable: true }) // <-- NUEVO CAMPO: Descripción/Biografía corta
  description: string;

  @Column({ nullable: true }) // Número de teléfono del empleado
  phone: string;

  @Column({ nullable: true }) // URL de la imagen del empleado (Cloudinary)
  imageUrl: string;

  // No incluimos email, servicios ni horario de trabajo según tu indicación
}
