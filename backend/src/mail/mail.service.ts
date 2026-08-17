import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: +this.config.get('SMTP_PORT', '587'),
      secure: this.config.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  private get from() {
    return this.config.get('SMTP_FROM', 'Ybuddy <noreply@ybuddy.fr>');
  }

  private get frontendUrl() {
    return this.config.get('FRONTEND_URL', 'http://localhost:5173');
  }

  async sendVerificationEmail(to: string, token: string) {
    const url = `${this.frontendUrl}/verify-email?token=${token}`;
    await this.send(to, 'Vérifiez votre adresse email — Ybuddy', `
      <div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#1E3A5F">Bienvenue sur Ybuddy 🏋️</h2>
        <p>Merci de vous être inscrit(e). Cliquez sur le bouton ci-dessous pour confirmer votre adresse email :</p>
        <a href="${url}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Confirmer mon email
        </a>
        <p style="color:#64748B;font-size:13px">Ce lien expire dans 24h. Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
    `);
  }

  async sendCoachNewRequest(coachEmail: string, coachName: string, clientName: string) {
    await this.send(coachEmail, `Nouvelle demande de coaching — ${clientName}`, `
      <div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#1E3A5F">Nouvelle demande reçue 📬</h2>
        <p>Bonjour ${coachName},</p>
        <p><strong>${clientName}</strong> vient de vous envoyer une demande de coaching.</p>
        <a href="${this.frontendUrl}/coach" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Voir la demande
        </a>
        <p style="color:#64748B;font-size:13px">Connectez-vous à votre tableau de bord pour accepter ou refuser.</p>
      </div>
    `);
  }

  async sendClientProgramReady(clientEmail: string, clientName: string, coachName: string) {
    await this.send(clientEmail, `Votre programme est prêt — Ybuddy`, `
      <div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#1E3A5F">Votre programme est disponible 🎯</h2>
        <p>Bonjour ${clientName},</p>
        <p><strong>${coachName}</strong> vient de vous envoyer votre programme d'entraînement personnalisé.</p>
        <a href="${this.frontendUrl}/client" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Voir mon programme
        </a>
        <p style="color:#64748B;font-size:13px">Connectez-vous à votre tableau de bord pour consulter vos exercices.</p>
      </div>
    `);
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent to ${to} — ${subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }
}
