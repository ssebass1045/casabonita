import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Query, 
  Put, 
  Delete, 
  NotFoundException 
} from '@nestjs/common';
import { ServicesPackService } from './services-pack.service';
import { ServicesPackSession } from './entities/services-pack-session.entity';
import { ServicesPack } from './entities/services-pack.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateServicesPackDto } from './dto/create-services-pack.dto';
import { ClientServicesPack } from './entities/client-services-pack.entity'; // <-- Nueva importación
import { CreateClientServicesPackDto } from './dto/create-client-services-pack.dto'; 
import { BadRequestException } from '@nestjs/common';


@Controller('services-pack')
export class ServicesPackController {
  constructor(private readonly servicesPackService: ServicesPackService) {}

  @Put('client/:id')
  async updateClientServicesPack(
    @Param('id') id: number,
    @Body() updateDto: CreateClientServicesPackDto,
  ): Promise<ClientServicesPack> {
    return this.servicesPackService.updateClientServicesPack(id, updateDto);
  }


  // CRUD para ServicesPack
  @Get()
  async getAllServicesPacks(): Promise<ServicesPack[]> {
    return this.servicesPackService.getAllServicesPacks();
  }

  @Get(':id')
async getServicesPackById(@Param('id') id: number): Promise<ServicesPack> {
  // Agrega esta validación
  if (isNaN(id)) {
    throw new BadRequestException('ID inválido');
  }
  
  const pack = await this.servicesPackService.getServicesPackById(id);
  if (!pack) {
    throw new NotFoundException(`Paquete con ID ${id} no encontrado`);
  }
  return pack;
}

  @Post()
  async createServicesPack(@Body() createDto: CreateServicesPackDto): Promise<ServicesPack> {
    return this.servicesPackService.createServicesPack(createDto);
  }

  @Put(':id')
  async updateServicesPack(
    @Param('id') id: number,
    @Body() updateDto: CreateServicesPackDto,
  ): Promise<ServicesPack> {
    return this.servicesPackService.updateServicesPack(id, updateDto);
  }

  @Delete(':id')
  async deleteServicesPack(@Param('id') id: number): Promise<void> {
    return this.servicesPackService.deleteServicesPack(id);
  }


  // Endpoints para paquetes de clientes
  @Get('client/all')
  async getAllClientServicesPacks(): Promise<ClientServicesPack[]> {
    return this.servicesPackService.getAllClientServicesPacks();
  }

  @Get('client/:id')
  async getClientServicesPackById(@Param('id') id: number): Promise<ClientServicesPack> {
    const pack = await this.servicesPackService.getClientServicesPackById(id);
    if (!pack) {
      throw new NotFoundException(`Paquete del cliente con ID ${id} no encontrado`);
    }
    return pack;
  }

  @Post('client')
  async createClientServicesPack(
    @Body() createDto: CreateClientServicesPackDto,
  ): Promise<ClientServicesPack> {
    return this.servicesPackService.createClientServicesPack(createDto);
  }

  // Endpoints para sesiones
  @Post('session')
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<ServicesPackSession> {
    return this.servicesPackService.createServicesPackSession(
      createSessionDto.clientServicesPackId,
      createSessionDto.employeeId,
      createSessionDto.employeePayment,
      createSessionDto.notes,
    );
  }

  @Get('employee/:employeeId/sessions')
  async getEmployeeSessions(
    @Param('employeeId') employeeId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ServicesPackSession[]> {
    return this.servicesPackService.getEmployeePackSessions(
      employeeId,
      startDate,
      endDate,
    );
  }
}