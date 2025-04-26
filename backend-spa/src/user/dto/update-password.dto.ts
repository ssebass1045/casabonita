
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6) // Ejemplo
  newPassword: string;
}
