// File: backend-spa/src/treatment/dto/create-treatment.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer'; // <-- Agrega esta importación
import { TreatmentCategory } from '../entities/treatment.entity';

export class CreateTreatmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional() // La descripción es opcional
  description?: string;

  @IsOptional() // El precio es opcional
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }
    return value;
  })
  @IsNumber()
  @Min(0) // El precio no puede ser negativo
  price?: number;

  @IsString()
  @IsOptional() // La URL de la imagen es opcional
  imageUrl?: string;

  @IsEnum(TreatmentCategory)
  @IsOptional()
  category?: TreatmentCategory;

  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return (
        normalized === 'true' || normalized === '1' || normalized === 'yes'
      );
    }
    return false;
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
