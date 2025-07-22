// File: backend-spa/src/product/dto/create-product.dto.ts
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer'; // Asegúrate de que esta importación esté aquí
import { ProductCategory } from '../entities/product.entity';


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

  @IsOptional()
  @Transform(({ value }) => { // <-- NUEVA TRANSFORMACIÓN PARA isActive
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }
    return value; // Devuelve el valor original si no es 'true'/'false' string
  })
  @IsBoolean({ message: 'isActive must be a boolean value' }) // <-- Mensaje de error más específico
  isActive?: boolean;

  @IsEnum(ProductCategory) // Validación para el enum
  category: ProductCategory;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
