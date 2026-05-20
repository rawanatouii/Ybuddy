import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { MuscleGroup } from './exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';

@ApiTags('Exercises')
@Controller('exercises')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercises (optionally filter by muscle group)' })
  @ApiQuery({ name: 'muscleGroup', enum: MuscleGroup, required: false, description: 'Filter by muscle group' })
  @ApiResponse({ status: 200, description: 'Returns list of exercises' })
  findAll(@Query('muscleGroup') muscleGroup?: MuscleGroup) {
    return this.exercisesService.findAll(muscleGroup);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Returns exercise details' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  findOne(@Param('id') id: string) {
    return this.exercisesService.findById(+id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new exercise (Admin only)' })
  @ApiResponse({ status: 201, description: 'Exercise created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  create(@Body() dto: CreateExerciseDto) {
    return this.exercisesService.create(dto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an exercise (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateExerciseDto>) {
    return this.exercisesService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an exercise (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  remove(@Param('id') id: string) {
    return this.exercisesService.remove(+id);
  }
}

