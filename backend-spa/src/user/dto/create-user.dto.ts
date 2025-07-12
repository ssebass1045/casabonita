// File: backend-spa/src/user/dto/create-user.dto.ts
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  // --- ¡AÑADE ESTAS LÍNEAS! ---
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
