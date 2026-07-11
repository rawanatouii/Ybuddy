import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ExercisesModule } from './exercises/exercises.module';
import { ProgramsModule } from './programs/programs.module';
import { RequestsModule } from './requests/requests.module';
import { AdminModule } from './admin/admin.module';
import { CoachesModule } from './coaches/coaches.module';
import { User } from './users/user.entity';
import { Client } from './clients/client.entity';
import { Exercise } from './exercises/exercise.entity';
import { Program } from './programs/program.entity';
import { ProgramDay } from './programs/program-day.entity';
import { ProgramExercise } from './programs/program-exercise.entity';
import { Request } from './requests/request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ── Rate limiting global (OWASP A04 — brute force) ────────────────────────
    // Limite : 20 requêtes par 60 secondes par IP
    // Sur la route POST /api/auth/login : limite réduite à 5 tentatives (voir AuthModule)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [User, Client, Exercise, Program, ProgramDay, ProgramExercise, Request],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    ExercisesModule,
    ProgramsModule,
    RequestsModule,
    AdminModule,
    CoachesModule,
  ],
  providers: [
    // ThrottlerGuard appliqué globalement à toutes les routes
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
