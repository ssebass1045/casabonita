import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum TreatmentCategory {
  FACIAL = 'facial',
  CORPORAL = 'corporal',
  DEPILACION = 'depilacion',
  CEJAS_PESTANAS = 'cejas_pestanas',
  MASAJES_RELAJACION = 'masajes_relajacion',
  CUIDADO_PIEL = 'cuidado_piel',
  BELLEZA = 'belleza',
  OTROS = 'otros',
}

@Entity()
export class Treatment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: TreatmentCategory,
    enumName: 'treatment_category_enum',
    default: TreatmentCategory.OTROS,
  })
  category: TreatmentCategory;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;
}
