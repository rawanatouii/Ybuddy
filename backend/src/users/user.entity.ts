import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Request } from '../requests/request.entity';
import { Program } from '../programs/program.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  CLIENT = 'CLIENT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: false })
  publicProfileName: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Client, (client) => client.user, { nullable: true })
  client: Client;

  @OneToMany(() => Request, (req) => req.coach, { nullable: true })
  coachRequests: Request[];

  @OneToMany(() => Program, (prog) => prog.coach, { nullable: true })
  coachPrograms: Program[];
}
