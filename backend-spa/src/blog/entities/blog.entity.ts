
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity() // Esto le dice a TypeORM que esta clase es una entidad
export class Blog {
  @PrimaryGeneratedColumn() // Clave primaria autogenerada
  id: number;

  @Column() // Columna para el título del blog
  title: string;

  @Column({ type: 'text' }) // Columna para el contenido del blog (puede ser largo)
  content: string;

  @Column({ nullable: true }) // Columna para el autor (opcional)
  author: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Columna para la fecha de creación
  createdAt: Date;

  @Column({ nullable: true }) // Columna para la URL de la imagen principal (opcional)
  imageUrl: string;

  
}
