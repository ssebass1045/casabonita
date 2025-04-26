// File: backend-spa/src/blog/blog.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ParseIntPipe, ValidationPipe, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Importa FileInterceptor
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from '@nestjs/passport';
import { Express } from 'express'; // Necesario para el tipo Express.Multer.File

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // --- Rutas Protegidas ---

  @UseGuards(AuthGuard('jwt')) // Protegido
  @Post()
  @UseInterceptors(FileInterceptor('image')) // Intercepta archivo del campo 'image'
  create(
    @Body(ValidationPipe) createBlogDto: CreateBlogDto,
    @UploadedFile() file?: Express.Multer.File // Inyecta el archivo (opcional)
    // @Request() req // Podrías inyectar Request si necesitas el ID del usuario para el autor
  ) {
    // const userId = req.user.userId; // Ejemplo para obtener ID del usuario
    return this.blogService.create(createBlogDto, file);
  }

  @UseGuards(AuthGuard('jwt')) // Protegido
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image')) // Intercepta archivo del campo 'image'
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateBlogDto: UpdateBlogDto,
    @UploadedFile() file?: Express.Multer.File // Inyecta el archivo (opcional)
  ) {
    return this.blogService.update(id, updateBlogDto, file);
  }

  @UseGuards(AuthGuard('jwt')) // Protegido
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.remove(id);
  }

  // --- Rutas Públicas ---

  @Get() // Público
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id') // Público
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findOne(id);
  }
}
