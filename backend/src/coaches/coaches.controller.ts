import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Coaches')
@Controller('coaches')
export class CoachesController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all coaches' })
  @ApiResponse({ status: 200, description: 'Returns list of all coaches' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.usersService.findAllCoaches();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get coach by slug (Public)' })
  @ApiParam({ name: 'slug', type: String, description: 'Coach slug' })
  @ApiResponse({ status: 200, description: 'Returns coach profile' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.usersService.findBySlug(slug);
  }
}

