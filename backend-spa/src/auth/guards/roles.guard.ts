// File: backend-spa/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtiene los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no se especifican roles en el decorador, permite el acceso
    if (!requiredRoles) {
      return true;
    }

    // Obtiene el usuario del objeto de solicitud (adjuntado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Comprueba si el rol del usuario está incluido en los roles requeridos
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
