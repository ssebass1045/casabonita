// File: backend-spa/src/treatment/dto/create-treatment.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer'; // <-- Agrega esta importación

export class CreateTreatmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional() // La descripción es opcional
  description?: string;

  @IsOptional() // El precio es opcional
  @Transform(({ value }) => {
    // Transforma string a number si es necesario
    if (typeof value === 'string' && value.trim() !== '') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num; // Devuelve el número o el valor original si no es válido
    }
    return value;
  })
  @IsNumber()
  @Min(0) // El precio no puede ser negativo
  price?: number;

  @IsString()
  @IsOptional() // La URL de la imagen es opcional
  imageUrl?: string;
}
