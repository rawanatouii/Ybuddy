import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Client full name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 25, description: 'Client age' })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({ example: 170, description: 'Height in cm' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 65, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 'Lose weight', description: 'Fitness goal' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({ example: 'Software engineer', description: 'Occupation' })
  @IsOptional()
  @IsString()
  work?: string;

  @ApiPropertyOptional({ example: 'None', description: 'Known diseases' })
  @IsOptional()
  @IsString()
  diseases?: string;

  @ApiPropertyOptional({ example: 'None', description: 'Past injuries' })
  @IsOptional()
  @IsString()
  injuries?: string;

  @ApiPropertyOptional({ example: 'Moderate', description: 'Activity level' })
  @IsOptional()
  @IsString()
  activityLevel?: string;

  @ApiPropertyOptional({ example: 'Omnivore', description: 'Diet type' })
  @IsOptional()
  @IsString()
  diet?: string;

  @ApiPropertyOptional({ example: 3, description: 'Workouts per week' })
  @IsOptional()
  @IsNumber()
  workoutFrequency?: number;
}

