// File: backend-spa/src/client/entities/client.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Gender } from '../enums/gender.enum';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'text', nullable: true }) 
  observations: string;
}
