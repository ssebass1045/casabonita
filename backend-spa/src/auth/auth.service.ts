// File: backend-spa/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);

    if (user) {
      // Compara la contraseña proporcionada con el hash almacenado
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        // Si coinciden, devuelve el usuario sin la contraseña
        const { password, ...result } = user;
        return result;
      }
    }
    // Si el usuario no existe o la contraseña no coincide, lanza excepción
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
