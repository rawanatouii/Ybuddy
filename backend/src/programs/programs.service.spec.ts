import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { Program } from './program.entity';
import { ProgramDay, DayType } from './program-day.entity';
import { ProgramExercise } from './program-exercise.entity';
import { ClientsService } from '../clients/clients.service';
import { ExercisesService } from '../exercises/exercises.service';
import { MailService } from '../mail/mail.service';

const mockClient = { id: 1, user: { id: 10, name: 'Alice' } };
const mockExercise = { id: 5, name: 'Squat', muscleGroup: 'legs' };

const mockProgramRepo = {
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockDayRepo = {
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
};

const mockPeRepo = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockClientsService = {
  findById: jest.fn(),
  findByUser: jest.fn(),
};

const mockExercisesService = {
  findById: jest.fn(),
};

const mockMailService = {
  sendClientProgramReady: jest.fn(),
};

describe('ProgramsService', () => {
  let service: ProgramsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramsService,
        { provide: getRepositoryToken(Program), useValue: mockProgramRepo },
        { provide: getRepositoryToken(ProgramDay), useValue: mockDayRepo },
        { provide: getRepositoryToken(ProgramExercise), useValue: mockPeRepo },
        { provide: ClientsService, useValue: mockClientsService },
        { provide: ExercisesService, useValue: mockExercisesService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
    jest.clearAllMocks();
  });

  // ── createProgram ─────────────────────────────────────────────────────────

  describe('createProgram', () => {
    it('crée un programme avec le bon nombre de jours', async () => {
      const savedProgram = { id: 1, client: mockClient, coach: { id: 2 }, duration: '4 weeks' };
      const fullProgram = { ...savedProgram, days: [{ id: 1, dayNumber: 1, type: DayType.WORKOUT }] };

      mockClientsService.findById.mockResolvedValue(mockClient);
      mockProgramRepo.create.mockReturnValue(savedProgram);
      mockProgramRepo.save.mockResolvedValue(savedProgram);
      mockDayRepo.create.mockImplementation((d) => d);
      mockDayRepo.save.mockImplementation((d) => Promise.resolve({ id: d.dayNumber, ...d }));
      mockProgramRepo.findOne.mockResolvedValue(fullProgram);

      const result = await service.createProgram(2, 1, { duration: '4 weeks', days: 1 });

      expect(mockClientsService.findById).toHaveBeenCalledWith(1);
      expect(mockProgramRepo.save).toHaveBeenCalledTimes(1);
      expect(mockDayRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(fullProgram);
    });

    it('génère le bon nombre de jours selon le paramètre days', async () => {
      const savedProgram = { id: 2, client: mockClient, coach: { id: 2 } };
      mockClientsService.findById.mockResolvedValue(mockClient);
      mockProgramRepo.create.mockReturnValue(savedProgram);
      mockProgramRepo.save.mockResolvedValue(savedProgram);
      mockDayRepo.create.mockImplementation((d) => d);
      mockDayRepo.save.mockResolvedValue({});
      mockProgramRepo.findOne.mockResolvedValue({ ...savedProgram, days: [] });

      await service.createProgram(2, 1, { days: 7 });

      expect(mockDayRepo.save).toHaveBeenCalledTimes(7);
    });
  });

  // ── addExerciseToDay ─────────────────────────────────────────────────────

  describe('addExerciseToDay', () => {
    it('ajoute un exercice à un jour existant', async () => {
      const day = { id: 3, type: DayType.WORKOUT };
      const pe = { id: 10, exercise: mockExercise, programDay: day, sets: 3, reps: 10 };

      mockExercisesService.findById.mockResolvedValue(mockExercise);
      mockDayRepo.findOne.mockResolvedValue(day);
      mockPeRepo.create.mockReturnValue(pe);
      mockPeRepo.save.mockResolvedValue(pe);

      const result = await service.addExerciseToDay(3, 5, 3, 10);

      expect(mockExercisesService.findById).toHaveBeenCalledWith(5);
      expect(mockDayRepo.findOne).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(mockPeRepo.save).toHaveBeenCalledWith(pe);
      expect(result).toEqual(pe);
    });

    it('lève NotFoundException si le jour n\'existe pas', async () => {
      mockExercisesService.findById.mockResolvedValue(mockExercise);
      mockDayRepo.findOne.mockResolvedValue(null);

      await expect(service.addExerciseToDay(999, 5, 3, 10))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── removeExerciseFromDay ────────────────────────────────────────────────

  describe('removeExerciseFromDay', () => {
    it('supprime un exercice par son ID', async () => {
      mockPeRepo.delete.mockResolvedValue({ affected: 1 });

      await service.removeExerciseFromDay(10);

      expect(mockPeRepo.delete).toHaveBeenCalledWith(10);
    });
  });

  // ── setDayType ───────────────────────────────────────────────────────────

  describe('setDayType', () => {
    it('passe un jour en REST', async () => {
      const updatedDay = { id: 3, type: DayType.REST };
      mockDayRepo.update.mockResolvedValue({});
      mockDayRepo.findOne.mockResolvedValue(updatedDay);

      const result = await service.setDayType(3, DayType.REST);

      expect(mockDayRepo.update).toHaveBeenCalledWith(3, { type: DayType.REST });
      expect(result).toEqual(updatedDay);
    });

    it('passe un jour en WORKOUT', async () => {
      const updatedDay = { id: 3, type: DayType.WORKOUT };
      mockDayRepo.update.mockResolvedValue({});
      mockDayRepo.findOne.mockResolvedValue(updatedDay);

      const result = await service.setDayType(3, DayType.WORKOUT);

      expect(mockDayRepo.update).toHaveBeenCalledWith(3, { type: DayType.WORKOUT });
      expect(result.type).toBe(DayType.WORKOUT);
    });
  });

  // ── sendToClient ─────────────────────────────────────────────────────────

  describe('sendToClient', () => {
    it('marque le programme comme envoyé', async () => {
      const sentProgram = { id: 1, sent: true, days: [] };
      mockProgramRepo.update.mockResolvedValue({});
      mockProgramRepo.findOne.mockResolvedValue(sentProgram);

      const result = await service.sendToClient(1);

      expect(mockProgramRepo.update).toHaveBeenCalledWith(1, { sent: true });
      expect(result.sent).toBe(true);
    });
  });

  // ── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('retourne un programme avec toutes ses relations', async () => {
      const program = { id: 1, client: mockClient, coach: { id: 2 }, days: [] };
      mockProgramRepo.findOne.mockResolvedValue(program);

      const result = await service.findById(1);

      expect(mockProgramRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['client', 'client.user', 'coach', 'days', 'days.exercises', 'days.exercises.exercise'],
      });
      expect(result).toEqual(program);
    });

    it('lève NotFoundException si le programme n\'existe pas', async () => {
      mockProgramRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── findByClient ─────────────────────────────────────────────────────────

  describe('findByClient', () => {
    it('retourne uniquement les programmes envoyés au client', async () => {
      const programs = [{ id: 1, sent: true }, { id: 2, sent: true }];
      mockClientsService.findByUser.mockResolvedValue({ id: 1 });
      mockProgramRepo.find.mockResolvedValue(programs);

      const result = await service.findByClient(10);

      expect(mockProgramRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { client: { id: 1 }, sent: true } })
      );
      expect(result).toHaveLength(2);
    });

    it('retourne un tableau vide si le client n\'existe pas', async () => {
      mockClientsService.findByUser.mockResolvedValue(null);

      const result = await service.findByClient(999);

      expect(result).toEqual([]);
      expect(mockProgramRepo.find).not.toHaveBeenCalled();
    });
  });

  // ── findByCoach ───────────────────────────────────────────────────────────

  describe('findByCoach', () => {
    it('retourne les programmes du coach triés par date', async () => {
      const programs = [{ id: 2 }, { id: 1 }];
      mockProgramRepo.find.mockResolvedValue(programs);

      const result = await service.findByCoach(2);

      expect(mockProgramRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { coach: { id: 2 } },
          order: { createdAt: 'DESC' },
        })
      );
      expect(result).toHaveLength(2);
    });
  });
});
