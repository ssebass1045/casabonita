
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateTreatmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional() // La descripción es opcional
  description?: string;

  @IsNumber()
  @Min(0) // El precio no puede ser negativo
  @IsOptional() // El precio es opcional
  price?: number;

  @IsString()
  @IsOptional() // La URL de la imagen es opcional
  imageUrl?: string;
}
