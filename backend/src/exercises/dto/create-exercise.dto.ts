import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MuscleGroup } from '../exercise.entity';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Bench Press', description: 'Exercise name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: MuscleGroup, example: MuscleGroup.CHEST, description: 'Target muscle group' })
  @IsEnum(MuscleGroup)
  muscleGroup: MuscleGroup;

  @ApiPropertyOptional({ example: 'https://example.com/bench.gif', description: 'GIF demonstration URL' })
  @IsOptional()
  @IsString()
  gifUrl?: string;

  @ApiPropertyOptional({ example: 'Lie on bench, press bar up', description: 'Exercise instructions' })
  @IsOptional()
  @IsString()
  description?: string;
}

