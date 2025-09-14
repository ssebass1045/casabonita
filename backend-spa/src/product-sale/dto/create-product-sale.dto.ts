// File: backend-spa/src/product-sale/dto/create-product-sale.dto.ts
import {
  IsNotEmpty,
  IsNumber,
  Min,
  IsInt,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { PaymentMethod } from 'src/appointment/enums/payment-method.enum';

export class CreateProductSaleDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  // ELIMINAMOS:
  // @IsNumber()
  // @IsNotEmpty()
  // clientId: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  pricePerUnit: number;

  // --- NUEVO CAMPO AÑADIDO ---
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
  // --- FIN DEL NUEVO CAMPO ---
}
