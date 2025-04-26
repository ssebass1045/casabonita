
import { Controller, Patch, Body, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt')) // Protege con JWT
  @Patch('password') // Ruta PATCH /user/password
  async updateOwnPassword(
    @Request() req,
    @Body(ValidationPipe) updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user.userId; // ID del usuario del token
    await this.userService.updatePassword(userId, updatePasswordDto); // Llama al servicio (que ahora usa bcrypt)
    return { message: 'Contraseña actualizada correctamente' };
  }

  
}
