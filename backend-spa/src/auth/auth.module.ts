
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importa ConfigModule y ConfigService
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // <-- Aún no existe, lo importaremos más tarde

@Module({
  imports: [
    UserModule, 
    PassportModule, // Importa PassportModule para manejar estrategias
    JwtModule.registerAsync({ // Configura JwtModule de forma asíncrona para usar ConfigService
      imports: [ConfigModule], // Importa ConfigModule para acceder a las variables de entorno
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'default_secret_key', // Lee JWT_SECRET del .env
        signOptions: { expiresIn: '24h' }, // Configura la expiración del token (ej. 1 hora)
      }),
      inject: [ConfigService], // Inyecta ConfigService en useFactory
    }),
  ],
  controllers: [AuthController], // El controlador ya fue registrado por 'nest generate'
  providers: [
    AuthService, // El servicio ya fue registrado por 'nest generate'
    LocalStrategy, // Registra LocalStrategy como proveedor
    JwtStrategy, // Registra JwtStrategy como proveedor
  ],
  exports: [AuthService], // Exporta AuthService si necesitas usarlo en otros módulos
})
export class AuthModule {}
