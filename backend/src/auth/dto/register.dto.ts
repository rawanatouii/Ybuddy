import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/user.entity';

// Only CLIENT and COACH can self-register — ADMIN is provisioned via seed only
const REGISTRABLE_ROLES = [UserRole.CLIENT, UserRole.COACH] as const;
type RegistrableRole = (typeof REGISTRABLE_ROLES)[number];

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 6 chars)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: REGISTRABLE_ROLES, example: UserRole.CLIENT, description: 'User role (CLIENT or COACH only)' })
  @IsEnum(REGISTRABLE_ROLES)
  role: RegistrableRole;

  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'john-doe', description: 'Public profile slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'John', description: 'Public profile name' })
  @IsOptional()
  @IsString()
  publicProfileName?: string;
}

