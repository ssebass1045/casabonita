// File: backend-spa/src/user/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// --- ¡AÑADE ESTE ENUM! ---
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  // --- ¡AÑADE ESTA COLUMNA! ---
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STAFF, // Por defecto, los nuevos usuarios serán STAFF
  })
  role: UserRole;
}
