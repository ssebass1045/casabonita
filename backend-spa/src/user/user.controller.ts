// File: backend-spa/src/user/user.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator'; // <-- Importa el decorador
import { UserRole } from './entities/user.entity'; // <-- Importa el enum
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- Importa el guardia

//@UseGuards(AuthGuard('jwt'), RolesGuard) // <-- Añade RolesGuard
//@Roles(UserRole.ADMIN) // <-- Añade el decorador Roles
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN) // <-- Solo ADMIN puede crear
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  @Roles(UserRole.ADMIN) // <-- Solo ADMIN puede ver la lista de usuarios
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  @Roles(UserRole.ADMIN) // <-- Solo ADMIN puede ver un usuario específico
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN) // <-- Solo ADMIN puede actualizar
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN) // <-- Solo ADMIN puede eliminar
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
