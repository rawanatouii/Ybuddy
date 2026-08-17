import { Controller, Get, Delete, Param, ParseIntPipe, Request as Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns platform statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of all users' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getUsers() {
    return this.adminService.getAllUsers();
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user and their related data (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete your own account' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.adminService.deleteUser(id, req.user.id);
  }
}

