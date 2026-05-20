import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post('profile')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create or update client profile' })
  @ApiResponse({ status: 200, description: 'Profile saved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Client access required' })
  async saveProfile(@Request() req, @Body() dto: CreateClientDto) {
    return this.clientsService.createOrUpdate(req.user, dto);
  }

  @Get('profile')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get current client profile' })
  @ApiResponse({ status: 200, description: 'Returns client profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Request() req) {
    return this.clientsService.findByUser(req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Get all clients (Admin/Coach only)' })
  @ApiResponse({ status: 200, description: 'Returns list of all clients' })
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Get client by ID (Admin/Coach only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Returns client details' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findById(+id);
  }
}

