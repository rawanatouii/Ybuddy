import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { RequestStatus } from './request.entity';

@ApiTags('Requests')
@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Post(':coachSlug')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Send coaching request to a coach (Client only)' })
  @ApiParam({ name: 'coachSlug', type: String, description: 'Coach slug' })
  @ApiResponse({ status: 201, description: 'Request sent successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  create(@Request() req, @Param('coachSlug') coachSlug: string) {
    return this.requestsService.create(req.user.id, coachSlug);
  }

  @Get('coach/mine')
  @Roles(UserRole.COACH)
  @ApiOperation({ summary: 'Get requests for current coach' })
  @ApiResponse({ status: 200, description: 'Returns coach requests' })
  getCoachRequests(@Request() req) {
    return this.requestsService.findByCoach(req.user.id);
  }

  @Get('client/mine')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get requests sent by current client' })
  @ApiResponse({ status: 200, description: 'Returns client requests' })
  getClientRequests(@Request() req) {
    return this.requestsService.findByClient(req.user.id);
  }

  @Patch(':id/status')
  @Roles(UserRole.COACH)
  @ApiOperation({ summary: 'Update request status (Coach only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: RequestStatus) {
    return this.requestsService.updateStatus(+id, status);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all requests (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all requests' })
  findAll() {
    return this.requestsService.findAll();
  }
}

