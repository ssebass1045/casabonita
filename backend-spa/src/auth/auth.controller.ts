
import { Controller, Post, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth') // Define el prefijo de ruta para este controlador (/auth)
export class AuthController {
  constructor(private authService: AuthService) {} // Inyecta AuthService

  @HttpCode(HttpStatus.OK) // Establece el código de estado HTTP a 200 OK para esta ruta
  @UseGuards(AuthGuard('local')) // Aplica el guardia de autenticación local
  @Post('login') // Define esta ruta como POST /auth/login
  async login(@Request() req) {
    // Si AuthGuard('local') tiene éxito, req.user contendrá el usuario validado por LocalStrategy
    return this.authService.login(req.user); // Llama al servicio para generar el token JWT
  }

  // Opcional: Puedes agregar una ruta de prueba para verificar la estrategia JWT
  // @UseGuards(AuthGuard('jwt'))
  // @Get('profile')
  // getProfile(@Request() req) {
  //   // Si AuthGuard('jwt') tiene éxito, req.user contendrá el payload validado del token
  //   return req.user;
  // }
}
