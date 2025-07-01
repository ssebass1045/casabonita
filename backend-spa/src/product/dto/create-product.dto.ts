// File: backend-spa/src/product/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator'; // Importa IsBoolean
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }
    return value;
  })
  @IsNumber({}, { message: 'price must be a number' })
  @Min(0, { message: 'price must not be less than 0' })
  price: number;

  @IsOptional() // isActive puede ser opcional al crear, con default en la entidad
  @IsBoolean() // <-- CAMBIO: stock por isActive
  isActive?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
