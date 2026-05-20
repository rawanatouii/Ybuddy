import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { DayType } from './program-day.entity';

@ApiTags('Programs')
@Controller('programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @Post()
  @Roles(UserRole.COACH)
  @ApiOperation({ summary: 'Create a new program (Coach only)' })
  @ApiResponse({ status: 201, description: 'Program created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Coach access required' })
  create(@Request() req, @Body() body: { clientId: number; startDate?: Date; duration?: string; days: number }) {
    return this.programsService.createProgram(req.user.id, body.clientId, body);
  }

  @Get('coach/mine')
  @Roles(UserRole.COACH)
  @ApiOperation({ summary: 'Get programs created by current coach' })
  @ApiResponse({ status: 200, description: 'Returns coach programs' })
  getCoachPrograms(@Request() req) {
    return this.programsService.findByCoach(req.user.id);
  }

  @Get('client/mine')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get programs assigned to current client' })
  @ApiResponse({ status: 200, description: 'Returns client programs' })
  getClientPrograms(@Request() req) {
    return this.programsService.findByClient(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.COACH, UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get program by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Program ID' })
  @ApiResponse({ status: 200, description: 'Returns program details' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  findOne(@Param('id') id: string) {
    return this.programsService.findById(+id);
  }

  @Post(':id/send')
  @Roles(UserRole.COACH)
  @ApiOperation({ summary: 'Send program to client (Coach only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Program ID' })
  @ApiResponse({ status: 200, description: 'Program sent to client' })
  send(@Param('id') id: string) {
    return this.programsService.sendToClient(+id);
  }

  @Post('day/:dayId/exercises')
  @Roles(UserRole.COACH)
  @ApiOperation({ summary: 'Add exercise to a program day (Coach only)' })
  @ApiParam({ name: 'dayId', type: Number, description: 'Program Day ID' })
  @ApiResponse({ status: 201, description: 'Exercise added to day' })
  addExercise(
    @Param('dayId') dayId: string,
    @Body() body: { exerciseId: number; sets: number; reps: number },
  ) {
    return this.programsService.addExerciseToDay(+dayId, body.exerciseId, body.sets, body.reps);
  }

  @Delete('day/exercise/:peId')
  @Roles(UserRole.COACH)
  @ApiOperation({ summary: 'Remove exercise from a program day (Coach only)' })
  @ApiParam({ name: 'peId', type: Number, description: 'Program Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise removed from day' })
  removeExercise(@Param('peId') peId: string) {
    return this.programsService.removeExerciseFromDay(+peId);
  }

  @Patch('day/:dayId/type')
  @Roles(UserRole.COACH)
  @ApiOperation({ summary: 'Set day type (workout/rest) (Coach only)' })
  @ApiParam({ name: 'dayId', type: Number, description: 'Program Day ID' })
  @ApiResponse({ status: 200, description: 'Day type updated' })
  setDayType(@Param('dayId') dayId: string, @Body('type') type: DayType) {
    return this.programsService.setDayType(+dayId, type);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all programs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all programs' })
  findAll() {
    return this.programsService.findAll();
  }
}

