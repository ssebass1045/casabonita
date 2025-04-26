
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog) // Inyecta el repositorio de Blog
    private blogRepository: Repository<Blog>,
    private cloudinaryService: CloudinaryService,
  ) {}

  // Crear un nuevo post de blog
  async create(
    createBlogDto: CreateBlogDto,
    file?: Express.Multer.File // Acepta un archivo opcional
  ): Promise<Blog> {

  let imageUrl: string | undefined = undefined;
  if (file) {
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      imageUrl = result.secure_url; // Obtiene la URL segura
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      // Manejar error
    }
  }

  const newBlog = this.blogRepository.create({
      ...createBlogDto,
      imageUrl: imageUrl ?? createBlogDto.imageUrl, // Usa la URL subida o la del DTO
      // Podrías asignar el autor aquí si lo obtienes del token JWT
      // author: userId ? ... : createBlogDto.author
  });
  return this.blogRepository.save(newBlog);
}

  // Obtener todos los posts de blog
  async findAll(): Promise<Blog[]> {
    // Puedes añadir opciones como ordenación por fecha
    return this.blogRepository.find({ order: { createdAt: 'DESC' } });
  }

  // Obtener un post de blog por ID
  async findOne(id: number): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException(`Post de blog con ID ${id} no encontrado`);
    }
    return blog;
  }

  // Actualizar un post de blog por ID
  async update(
    id: number,
    updateBlogDto: UpdateBlogDto,
    file?: Express.Multer.File // Acepta un archivo opcional
  ): Promise<Blog> {

  const blog = await this.blogRepository.preload({ id });
  if (!blog) {
    throw new NotFoundException(`Post de blog con ID ${id} no encontrado para actualizar`);
  }

  let imageUrl: string | undefined = blog.imageUrl; // Mantiene la URL existente por defecto
  if (file) {
     // Opcional: Eliminar imagen antigua de Cloudinary
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      imageUrl = result.secure_url; // Obtiene la nueva URL segura
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      // Manejar error
    }
  } else if (updateBlogDto.imageUrl !== undefined) {
      // Permite actualizar/eliminar la URL manualmente si no se sube archivo
      imageUrl = updateBlogDto.imageUrl;
  }

  // Actualiza la entidad con datos del DTO y la nueva URL
  const updatedBlog = this.blogRepository.merge(blog, {
      ...updateBlogDto,
      imageUrl: imageUrl,
  });

  return this.blogRepository.save(updatedBlog);
}

  // Eliminar un post de blog por ID
  async remove(id: number): Promise<void> {
    const result = await this.blogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post de blog con ID ${id} no encontrado para eliminar`);
    }
  }
}
