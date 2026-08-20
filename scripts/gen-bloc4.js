const {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, WidthType, ShadingType,
  BorderStyle, PageBreak, VerticalAlign, ImageRun,
} = require('docx');
const fs = require('fs');

// ── Tokens ────────────────────────────────────────────────────────────────────
const NAVY   = '1E3A5F';
const ACCENT = '2563EB';
const WHITE  = 'FFFFFF';
const LIGHT  = 'F8FAFC';
const GRAY   = 'E2E8F0';
const GREEN  = 'DCFCE7';
const RED    = 'FEE2E2';
const ORANGE = 'FEF3C7';
const BLUE   = 'DBEAFE';
const TEXT   = '1E293B';
const MUTED  = '64748B';

// ── Helpers ───────────────────────────────────────────────────────────────────
const h1 = t => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 30, color: WHITE, font: 'Calibri' })],
  shading: { type: ShadingType.CLEAR, fill: NAVY },
  spacing: { before: 400, after: 200 },
  indent: { left: 240, right: 240 },
});
const h2 = t => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 24, color: NAVY, font: 'Calibri' })],
  spacing: { before: 300, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT } },
});
const h3 = t => new Paragraph({
  children: [new TextRun({ text: t, bold: true, size: 21, color: ACCENT, font: 'Calibri' })],
  spacing: { before: 200, after: 80 },
});
const p = (t, o = {}) => new Paragraph({
  children: [new TextRun({ text: t, size: 20, color: TEXT, font: 'Calibri', ...o })],
  spacing: { after: 120 },
});
const bullet = t => new Paragraph({
  children: [new TextRun({ text: t, size: 20, color: TEXT, font: 'Calibri' })],
  bullet: { level: 0 },
  spacing: { after: 80 },
  indent: { left: 360, hanging: 200 },
});
const numbered = (n, t) => new Paragraph({
  children: [new TextRun({ text: `${n}.  ${t}`, size: 20, color: TEXT, font: 'Calibri' })],
  indent: { left: 400 },
  spacing: { after: 80 },
});
const pb = () => new Paragraph({ children: [new PageBreak()] });
const sp = () => new Paragraph({ spacing: { after: 160 } });

const cell = (text, { bold = false, bg = WHITE, color = TEXT, w = 2000, sz = 19, italic = false, align = AlignmentType.LEFT } = {}) =>
  new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: bg },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: String(text), size: sz, bold, color, italics: italic, font: 'Calibri' })],
    })],
  });

const hRow = (labels, widths) => new TableRow({
  tableHeader: true,
  children: labels.map((l, i) => cell(l, { bold: true, bg: NAVY, color: WHITE, w: widths[i] })),
});

const tbl = (headers, rows, widths) => new Table({
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: widths,
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: NAVY },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: NAVY },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideH: { style: BorderStyle.SINGLE, size: 2, color: GRAY },
    insideV: { style: BorderStyle.NONE },
  },
  rows: [
    hRow(headers, widths),
    ...rows.map((cols, ri) => new TableRow({
      children: cols.map((c, i) => {
        const rowBg = ri % 2 === 0 ? WHITE : LIGHT;
        const base = { w: widths[i], bg: rowBg };
        if (typeof c === 'object' && c.text !== undefined) return cell(c.text, { ...base, ...c });
        return cell(c, base);
      }),
    })),
  ],
});

const pageProps = { page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, bottom: 1200, left: 1440, right: 1200 } } };

// ══════════════════════════════════════════════════════════════════════════════
// COVER
// ══════════════════════════════════════════════════════════════════════════════
const cover = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 800, after: 120 },
    children: [new TextRun({ text: 'Ybuddy', bold: true, size: 96, color: ACCENT, font: 'Calibri' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'Plateforme de Coaching Sportif Personnalisé', size: 26, color: NAVY, font: 'Calibri', italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT } },
    children: [new TextRun({ text: '', size: 4 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text: 'DOSSIER TECHNIQUE', bold: true, size: 36, color: NAVY, font: 'Calibri' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'BLOC 4 — MAINTENIR L\'APPLICATION LOGICIELLE EN CONDITION OPÉRATIONNELLE', size: 20, color: MUTED, font: 'Calibri' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'RNCP Niveau 7 — Expert en Développement Logiciel', size: 20, color: MUTED, font: 'Calibri' })],
  }),
  sp(), sp(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: 'Rawan Atwe', bold: true, size: 24, color: TEXT, font: 'Calibri' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: 'M2 Expert en Développement Logiciel', size: 20, color: MUTED, font: 'Calibri' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: 'Juillet 2026', size: 20, color: MUTED, font: 'Calibri' })],
  }),
  sp(),
  new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: 'Sommaire', bold: true, size: 22, color: NAVY, font: 'Calibri' })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT } },
  }),
  tbl(['Section', 'Compétence', 'Statut'], [
    ['§1 — Mise à jour des dépendances', 'C4.1.1', { text: '✅ v1.0.0', bg: GREEN }],
    ['§2 — Système de supervision', 'C4.1.2 ⚠ Éliminatoire', { text: '✅ v1.0.0', bg: GREEN }],
    ['§3 — Processus de collecte des anomalies', 'C4.2.1 ⚠ Éliminatoire', { text: '✅ v1.0.0 + v1.1.0', bg: GREEN }],
    ['§4 — Fiche de consignation — BUG-07', 'C4.2.1', { text: '✅ CORRIGÉ v1.1.0', bg: GREEN }],
    ['§5 — Traitement de l\'anomalie BUG-07', 'C4.2.2', { text: '✅ DÉPLOYÉ v1.1.0', bg: GREEN }],
    ['§6 — Recommandations d\'amélioration', 'C4.3.1', { text: '✅ v1.1.0 + v1.2.0', bg: GREEN }],
    ['§7 — Journal de version (v1.0.0 → v1.1.0)', 'C4.3.2 ⚠ Éliminatoire', { text: '✅ À jour', bg: GREEN }],
    ['§8 — Collaboration support client', 'C4.3.3', { text: '✅ v1.0.0', bg: GREEN }],
  ], [4500, 2800, 2780]),
  pb(),
];

// ══════════════════════════════════════════════════════════════════════════════
// §1 — MISE À JOUR DES DÉPENDANCES (C4.1.1)
// ══════════════════════════════════════════════════════════════════════════════
const sec1 = [
  h1('§1 — Processus de Mise à Jour des Dépendances  (C4.1.1)'),
  sp(),
  h2('1.1 Périmètre logiciel concerné'),
  tbl(['Périmètre', 'Gestionnaire', 'Fichier de verrouillage'], [
    ['Backend — NestJS 10 + TypeScript', 'npm 10+', 'backend/package-lock.json'],
    ['Frontend — React 18 + Vite', 'npm 10+', 'frontend/package-lock.json'],
    ['Infrastructure — Docker Compose', 'Images Docker Hub', 'docker-compose.yml'],
  ], [3500, 2500, 4080]),
  sp(),
  h2('1.2 Fréquence et type de mise à jour'),
  tbl(['Type de mise à jour', 'Fréquence', 'Déclencheur', 'Mode'], [
    ['Audit sécurité (vulnérabilités critiques)', 'À chaque push', 'GitHub Actions CI', 'Automatique — bloquant'],
    ['Patch (x.x.PATCH)', 'Mensuelle', 'Revue manuelle npm outdated', 'Manuel — PR dédiée'],
    ['Minor (x.MINOR.x)', 'Trimestrielle', 'Revue manuelle + test régression', 'Manuel — PR dédiée + tests'],
    ['Major (MAJOR.x.x)', 'Sur besoin', 'Décision technique documentée', 'Manuel — branche dédiée + recette complète'],
    ['Dépendances Docker', 'Trimestrielle', 'Vérification digest image', 'Manuel'],
  ], [2800, 1800, 2400, 3080]),
  sp(),
  h2('1.3 Processus détaillé'),
  h3('Étape 1 — Détection automatique (CI/CD)'),
  p('À chaque push sur main ou develop, le job security-audit du pipeline GitHub Actions exécute :'),
  bullet('npm audit --audit-level=critical dans backend/ et frontend/'),
  bullet('Si une vulnérabilité critique est détectée → le job échoue et le merge est bloqué'),
  bullet('Un email de notification GitHub est envoyé automatiquement au propriétaire du dépôt'),
  sp(),
  h3('Étape 2 — Revue mensuelle manuelle'),
  p('Le premier lundi de chaque mois, la procédure suivante est appliquée :'),
  numbered(1, 'npm outdated dans backend/ et frontend/ → liste des paquets obsolètes'),
  numbered(2, 'Évaluation des impacts : lecture du CHANGELOG de chaque paquet concerné'),
  numbered(3, 'Pour les mises à jour patch/minor : npm update + exécution des 33 tests unitaires'),
  numbered(4, 'Si les tests passent → commit sur branche update/deps-YYYY-MM + PR vers develop'),
  numbered(5, 'Merge uniquement si CI/CD green sur la PR'),
  sp(),
  h3('Étape 3 — Mise à jour majeure'),
  p('Les mises à jour majeures (ex : NestJS 10 → 11) suivent un processus renforcé :'),
  numbered(1, 'Création d\'une branche dédiée : upgrade/nestjs-v11'),
  numbered(2, 'Application de la migration guide officielle'),
  numbered(3, 'Exécution complète du cahier de recettes (20 scénarios)'),
  numbered(4, 'Revue de code par un pair avant merge'),
  numbered(5, 'Tag de version et mise à jour du journal (§7)'),
  sp(),
  h2('1.4 Commandes de référence'),
  tbl(['Commande', 'Rôle'], [
    ['npm outdated', 'Lister les paquets avec nouvelles versions disponibles'],
    ['npm audit --audit-level=critical', 'Détecter les vulnérabilités critiques (bloquant en CI)'],
    ['npm audit fix', 'Corriger automatiquement les vulnérabilités non-breaking'],
    ['npm update', 'Mettre à jour les paquets dans les bornes semver du package.json'],
    ['npm ci', 'Installation déterministe depuis package-lock.json (utilisé en CI)'],
  ], [4000, 6080]),
  pb(),
];

// ══════════════════════════════════════════════════════════════════════════════
// §2 — SYSTÈME DE SUPERVISION (C4.1.2)
// ══════════════════════════════════════════════════════════════════════════════
const sec2 = [
  h1('§2 — Système de Supervision et d\'Alerte  (C4.1.2)'),
  sp(),
  h2('2.1 Périmètre de supervision'),
  tbl(['Composant supervisé', 'Criticité', 'Indicateurs surveillés'], [
    ['API REST NestJS', 'Critique', 'Disponibilité, temps de réponse, taux d\'erreurs 5xx'],
    ['Base de données MariaDB', 'Critique', 'Connexion active, port 3307 accessible'],
    ['Frontend React (SPA)', 'Majeur', 'Accessibilité HTTP 200 sur /'],
    ['Pipeline CI/CD GitHub Actions', 'Majeur', 'Statut des jobs (pass/fail), durée'],
    ['Dépendances npm', 'Majeur', 'Vulnérabilités critiques détectées'],
    ['Authentification JWT', 'Critique', 'Taux d\'erreurs 401/403, tentatives brute force'],
  ], [3200, 1600, 5280]),
  sp(),
  h2('2.2 Sondes de suivi en place'),
  h3('Sonde 1 — Health check endpoint'),
  p('L\'endpoint GET /api retourne HTTP 200 et confirme que le serveur NestJS est opérationnel. Il est vérifié :'),
  bullet('Manuellement après chaque déploiement (checklist §7.4 du dossier BLOC 2)'),
  bullet('Via GitHub Actions : le job backend-test démarre le serveur et vérifie l\'absence d\'erreur au démarrage'),
  sp(),
  h3('Sonde 2 — Logger NestJS (journalisation intégrée)'),
  p('NestJS intègre un Logger natif actif sur toutes les couches de l\'application :'),
  tbl(['Niveau de log', 'Déclencheur', 'Exemple'], [
    ['LOG', 'Démarrage serveur, connexion DB', '[NestJS] Application listening on port 3000'],
    ['WARN', 'Tentative d\'accès refusée (403)', '[RolesGuard] Access denied for role CLIENT on /api/admin'],
    ['ERROR', 'Erreur non gérée, exception', '[ExceptionFilter] Internal server error — stack trace'],
    ['DEBUG', 'Requêtes entrantes (dev uniquement)', '[HTTP] POST /api/auth/login 201 — 234ms'],
  ], [2000, 3000, 5080]),
  sp(),
  h3('Sonde 3 — Rate limiting (ThrottlerModule)'),
  p('Le module @nestjs/throttler surveille le volume de requêtes et déclenche une alerte HTTP 429 :'),
  bullet('Seuil global : 20 requêtes / 60 secondes par IP'),
  bullet('Seuil login : 5 requêtes / 60 secondes (protection brute force)'),
  bullet('Chaque dépassement est loggé avec l\'IP source par le Logger NestJS'),
  sp(),
  h3('Sonde 4 — Audit sécurité CI (GitHub Actions)'),
  p('Le job security-audit s\'exécute à chaque push et constitue une sonde automatique sur l\'état des dépendances. Toute vulnérabilité critique fait échouer le pipeline et envoie une notification par email.'),
  sp(),
  h2('2.3 Configuration des alertes'),
  tbl(['Alerte', 'Seuil de déclenchement', 'Canal de signalement', 'Responsable'], [
    ['Vulnérabilité npm critique', 'Dès détection', 'Email GitHub → propriétaire dépôt', 'Dev / Rawan Atwe'],
    ['Échec CI/CD', 'Job failed', 'Email GitHub Actions', 'Dev / Rawan Atwe'],
    ['Rate limit dépassé', '> seuil ThrottlerModule', 'Log NestJS (WARN)', 'Monitoring log manuel'],
    ['Erreur 5xx', 'Toute exception non gérée', 'Log NestJS (ERROR)', 'Monitoring log manuel'],
    ['Indisponibilité API', 'GET /api ≠ 200', 'Constaté lors de la vérification post-déploiement', 'Dev / Rawan Atwe'],
  ], [2400, 2400, 2400, 2880]),
  sp(),
  h2('2.4 Évolution prévue — v1.1.0'),
  p('Le système de supervision actuel est fonctionnel mais manuel pour la production. La v1.1.0 intègrera :'),
  bullet('Sentry SDK — capture automatique des erreurs frontend et backend en production avec alertes temps réel'),
  bullet('Prometheus + Grafana — métriques HTTP (latence p95, taux erreur, requêtes/s) avec dashboard et alertes seuil'),
  bullet('Uptime monitoring — check de disponibilité toutes les 5 minutes via service externe (UptimeRobot)'),
  pb(),
];

// ══════════════════════════════════════════════════════════════════════════════
// §3 — PROCESSUS DE COLLECTE DES ANOMALIES (C4.2.1)
// ══════════════════════════════════════════════════════════════════════════════
const sec3 = [
  h1('§3 — Processus de Collecte et Consignation des Anomalies  (C4.2.1)'),
  sp(),
  h2('3.1 Canaux de détection'),
  tbl(['Canal', 'Description', 'Exemples Ybuddy'], [
    ['Tests automatisés (Jest)', 'Échec d\'un test unitaire lors du push → détecté en CI', 'Régression AuthService après refacto'],
    ['Pipeline CI/CD', 'Job failed → anomalie build ou test', 'BUG-03 : "Unknown column videoUrl"'],
    ['Test manuel (cahier de recettes)', 'Scénario FAIL lors de l\'exécution manuelle', 'BUG-07 : CR-AUTH-05 FAIL'],
    ['Retour utilisateur / support', 'Signalement d\'un coach ou client via formulaire/email', 'BUG-05 : CORS bloquait toutes les requêtes'],
    ['Monitoring logs', 'ERROR ou WARN détecté dans les logs NestJS', 'BUG-06 : Login silencieux Docker éteint'],
  ], [2400, 3200, 4480]),
  sp(),
  h2('3.2 Processus de consignation'),
  p('Toute anomalie détectée suit le processus suivant :'),
  numbered(1, 'Détection — via l\'un des canaux ci-dessus'),
  numbered(2, 'Qualification — attribution d\'un identifiant BUG-XX et d\'une priorité (P1/P2/P3)'),
  numbered(3, 'Consignation — remplissage de la fiche de consignation (template §4)'),
  numbered(4, 'Création GitHub Issue — avec label bug + priorité + assignation'),
  numbered(5, 'Analyse — identification de la cause racine'),
  numbered(6, 'Correctif — développement sur branche fix/BUG-XX'),
  numbered(7, 'Validation — tests unitaires + test du scénario de reproduction'),
  numbered(8, 'Déploiement — merge PR → CI/CD → production'),
  numbered(9, 'Clôture — mise à jour fiche + journal de version'),
  sp(),
  h2('3.3 Grille de priorités'),
  tbl(['Priorité', 'Définition', 'Délai de correction', 'Exemples Ybuddy'], [
    ['P1 — Critique', 'Bloque l\'application — aucun utilisateur ne peut se connecter ou utiliser le service', '< 24h', 'BUG-01, BUG-02'],
    ['P2 — Majeur', 'Fonctionnalité dégradée — le service fonctionne mais une feature importante est cassée', '< 3 jours', 'BUG-03, BUG-04, BUG-05, BUG-07'],
    ['P3 — Mineur', 'Anomalie cosmétique ou UX — le service fonctionne normalement', '< 1 semaine', 'BUG-06'],
  ], [1800, 3200, 1800, 3280]),
  sp(),
  h2('3.4 Bilan des anomalies Ybuddy v1.0.0'),
  tbl(['ID', 'Priorité', 'Module', 'Statut'], [
    ['BUG-01', 'P1', 'Base de données / TypeORM', { text: 'CORRIGÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['BUG-02', 'P1', 'Auth / Admin seed', { text: 'CORRIGÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['BUG-03', 'P2', 'Exercices / seed', { text: 'CORRIGÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['BUG-04', 'P2', 'Seed AscendAPI', { text: 'CORRIGÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['BUG-05', 'P2', 'API / CORS', { text: 'CORRIGÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['BUG-06', 'P3', 'Frontend / UX', { text: 'CORRIGÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['BUG-07', 'P2', 'Auth / Frontend', { text: 'CORRIGÉ', bg: GREEN, bold: true, color: '2E7D32' }],
  ], [1400, 1400, 3500, 3780]),
  pb(),
];

// ══════════════════════════════════════════════════════════════════════════════
// §4 — FICHE DE CONSIGNATION BUG-07 (C4.2.1)
// ══════════════════════════════════════════════════════════════════════════════
const sec4 = [
  h1('§4 — Fiche de Consignation — BUG-07  (C4.2.1)'),
  sp(),
  tbl(['Champ', 'Valeur'], [
    ['Identifiant', 'BUG-07'],
    ['Date de détection', '15 Juillet 2026'],
    ['Date de résolution', '18 Juillet 2026'],
    ['Détecté par', 'Test manuel — scénario CR-AUTH-05 (cahier de recettes)'],
    ['Module concerné', 'Auth / Frontend (Axios interceptor + LoginPage)'],
    ['Priorité', { text: 'P2 — Majeur', bg: ORANGE, bold: true }],
    ['Statut', { text: 'CORRIGÉ — déployé v1.1.0', bg: GREEN, bold: true, color: '2E7D32' }],
    ['Assigné à', 'Rawan Atwe'],
    ['GitHub Issue', '#12 — label: bug, priority: P2 — FERMÉ'],
  ], [3000, 7080]),
  sp(),
  h2('4.1 Description de l\'anomalie'),
  p('Lorsqu\'un utilisateur (coach ou client) possède un token JWT expiré (durée de vie : 24h) et tente d\'effectuer une action nécessitant une authentification, l\'application ne redirige pas automatiquement vers la page de connexion. L\'utilisateur reste bloqué sur la page courante et voit une erreur réseau silencieuse dans la console.'),
  sp(),
  h2('4.2 Étapes de reproduction'),
  numbered(1, 'Se connecter avec un compte valide (coach@test.com)'),
  numbered(2, 'Dans les DevTools → Application → LocalStorage, remplacer le token JWT par un token expiré (généré manuellement avec expiry passée)'),
  numbered(3, 'Cliquer sur une action nécessitant l\'API (ex : "New Program", "My Clients")'),
  numbered(4, 'Observer le comportement'),
  sp(),
  h2('4.3 Comportement observé vs attendu'),
  tbl(['', 'Comportement'], [
    [{ text: 'Attendu', bold: true, bg: GREEN }, 'Intercepteur Axios détecte le 401 → efface le token → redirige vers /login avec message "Session expirée"'],
    [{ text: 'Observé', bold: true, bg: RED }, 'La page reste affichée. Une erreur réseau apparaît dans la console (Network Error ou 401). Aucun message utilisateur, aucune redirection.'],
  ], [2000, 8080]),
  sp(),
  h2('4.4 Logs et traces'),
  p('Console navigateur (DevTools → Console) :', { bold: true }),
  p('AxiosError: Request failed with status code 401', { font: 'Courier New', color: 'C62828' }),
  p('    at settle (axios.js:193)', { font: 'Courier New', color: MUTED }),
  p('    at XMLHttpRequest.onloadend (axios.js:1344)', { font: 'Courier New', color: MUTED }),
  sp(),
  p('Log NestJS backend :', { bold: true }),
  p('[JwtAuthGuard] Token verification failed — jwt expired', { font: 'Courier New', color: 'C62828' }),
  p('[ExceptionFilter] UnauthorizedException — 401 — /api/programs', { font: 'Courier New', color: MUTED }),
  sp(),
  h2('4.5 Analyse — cause racine'),
  p('Le frontend utilise Axios pour toutes les requêtes API. Aucun intercepteur de réponse n\'est configuré pour gérer le cas HTTP 401. En conséquence :'),
  bullet('L\'erreur 401 remontée par NestJS/JwtAuthGuard est capturée par le catch Axios mais n\'est pas traitée globalement'),
  bullet('Chaque composant React gère (ou ne gère pas) l\'erreur localement — sans logique centralisée de déconnexion'),
  bullet('Le token expiré reste dans le LocalStorage, empêchant toute récupération automatique'),
  sp(),
  h2('4.6 Impact'),
  tbl(['Dimension', 'Impact'], [
    ['Utilisateurs affectés', 'Tous — coach et client — après 24h de session inactive'],
    ['Sévérité UX', 'Majeure — l\'utilisateur ne comprend pas pourquoi les actions ne fonctionnent plus'],
    ['Sécurité', 'Faible — le token expiré est bien rejeté côté serveur (JwtAuthGuard fonctionnel)'],
    ['Criticité métier', 'P2 — l\'application reste fonctionnelle pour les sessions actives'],
  ], [2800, 7280]),
  pb(),
];

// ══════════════════════════════════════════════════════════════════════════════
// §5 — TRAITEMENT DE L'ANOMALIE BUG-07 (C4.2.2)
// ══════════════════════════════════════════════════════════════════════════════
const sec5 = [
  h1('§5 — Traitement de l\'Anomalie BUG-07  (C4.2.2)'),
  sp(),
  h2('5.1 Solution technique — DÉPLOYÉE'),
  p('Le correctif a été appliqué dans deux fichiers du frontend :'),
  sp(),
  h3('Fichier 1 — frontend/src/services/api.ts (intercepteur global)'),
  p('// frontend/src/services/api.ts', { font: 'Courier New', color: MUTED }),
  p('api.interceptors.response.use(', { font: 'Courier New', color: TEXT }),
  p('  (r) => r,', { font: 'Courier New', color: TEXT }),
  p('  (err) => {', { font: 'Courier New', color: TEXT }),
  p('    if (err.response?.status === 401) {', { font: 'Courier New', color: TEXT }),
  p('      localStorage.removeItem(\'token\');', { font: 'Courier New', color: TEXT }),
  p('      localStorage.removeItem(\'user\');', { font: 'Courier New', color: TEXT }),
  p('      window.location.href = \'/login?reason=session-expired\';', { font: 'Courier New', color: TEXT }),
  p('    }', { font: 'Courier New', color: TEXT }),
  p('    return Promise.reject(err);', { font: 'Courier New', color: TEXT }),
  p('  },', { font: 'Courier New', color: TEXT }),
  p(');', { font: 'Courier New', color: TEXT }),
  sp(),
  h3('Fichier 2 — frontend/src/pages/LoginPage.tsx (toast contextuel)'),
  p('// frontend/src/pages/LoginPage.tsx', { font: 'Courier New', color: MUTED }),
  p('const [searchParams] = useSearchParams();', { font: 'Courier New', color: TEXT }),
  p('useEffect(() => {', { font: 'Courier New', color: TEXT }),
  p('  if (searchParams.get(\'reason\') === \'session-expired\') {', { font: 'Courier New', color: TEXT }),
  p('    toast.error(\'Votre session a expiré. Veuillez vous reconnecter.\');', { font: 'Courier New', color: TEXT }),
  p('  }', { font: 'Courier New', color: TEXT }),
  p('}, []);', { font: 'Courier New', color: TEXT }),
  sp(),
  p('L\'intercepteur global supprime le token ET la session user du localStorage, puis redirige vers /login avec le paramètre reason=session-expired. La page de connexion détecte ce paramètre et affiche un toast d\'information.'),
  sp(),
  h2('5.2 Processus de déploiement appliqué'),
  tbl(['Étape', 'Action', 'Outil', 'Statut'], [
    ['1', 'Développement du correctif sur branche fix/BUG-07-session-expiry', 'Git', { text: '✅ Fait', bg: GREEN }],
    ['2', 'Exécution locale des 33 tests unitaires — aucune régression', 'Jest (npm test)', { text: '✅ 33/33 PASS', bg: GREEN }],
    ['3', 'Pull Request vers main — revue de code', 'GitHub PR', { text: '✅ Mergée', bg: GREEN }],
    ['4', 'CI/CD automatique : backend-test + frontend-build + security-audit', 'GitHub Actions', { text: '✅ Green', bg: GREEN }],
    ['5', 'Rejouer scénario CR-AUTH-05 → vérifier PASS', 'Test manuel', { text: '✅ PASS', bg: GREEN }],
    ['6', 'Clôture GitHub Issue #12 + mise à jour journal v1.1.0', 'GitHub + §7', { text: '✅ Fermé', bg: GREEN }],
  ], [500, 4200, 2400, 2980]),
  sp(),
  h2('5.3 Vérification du correctif'),
  p('Le scénario CR-AUTH-05 du cahier de recettes devient le test de non-régression de référence :'),
  tbl(['Étape', 'Résultat attendu après correctif'], [
    ['Token expiré en LocalStorage + action API', 'HTTP 401 reçu par l\'intercepteur Axios'],
    ['Intercepteur déclenché', 'localStorage.removeItem(\'token\') exécuté'],
    ['Redirection', 'window.location → /login?reason=session-expired'],
    ['Message utilisateur', '"Votre session a expiré. Veuillez vous reconnecter."'],
    ['Statut CR-AUTH-05', { text: '✅ PASS — vérifié le 18/07/2026', bg: GREEN, bold: true, color: '2E7D32' }],
  ], [4000, 6080]),
  pb(),
];

// ══════════════════════════════════════════════════════════════════════════════
// §6 — RECOMMANDATIONS D'AMÉLIORATION (C4.3.1)
// ══════════════════════════════════════════════════════════════════════════════
const sec6 = [
  h1('§6 — Recommandations d\'Amélioration  (C4.3.1)'),
  sp(),
  p('Les recommandations suivantes sont basées sur les indicateurs de performance mesurés en v1.0.0, les anomalies documentées (BUG-01 à BUG-07) et les retours utilisateurs recueillis lors des tests.'),
  sp(),
  h2('6.1 Améliorations prioritaires'),
  tbl(['ID', 'Recommandation', 'Priorité', 'Bénéfice attendu', 'Version'], [
    ['AME-01', 'Intercepteur Axios 401 → redirection automatique + toast (correctif BUG-07)', { text: 'P2', bg: ORANGE }, 'Éliminer le seul scénario FAIL du cahier de recettes — 20/20 PASS', { text: '✅ v1.1.0', bg: GREEN, bold: true, color: '2E7D32' }],
    ['AME-02', 'Tests e2e NestJS avec base MariaDB de test en CI', { text: 'P2', bg: ORANGE }, 'Prévenir les régressions sur les flux complets (inscription → programme → envoi)', 'v1.2.0'],
    ['AME-03', 'Intégration Sentry (monitoring erreurs production)', { text: 'P2', bg: ORANGE }, 'Détecter proactivement les erreurs 5xx sans consulter les logs manuellement', 'v1.2.0'],
    ['AME-04', 'Pagination cursor-based sur GET /exercises', { text: 'P3', bg: LIGHT }, 'Performances : actuellement 47 000+ exercices chargés sans pagination', 'v1.2.0'],
    ['AME-05', 'Messages d\'erreur explicites côté frontend', { text: 'P3', bg: LIGHT }, 'UX : err.response.data.message affiché dans tous les composants', { text: '✅ v1.1.0', bg: GREEN, bold: true, color: '2E7D32' }],
    ['AME-06', 'Tests React avec Vitest + React Testing Library', { text: 'P3', bg: LIGHT }, 'Couvrir les composants critiques (ProgramBuilder, AuthContext)', 'v1.2.0'],
    ['AME-07', 'Système de notifications email (vérification + coach + client)', { text: 'P2', bg: ORANGE }, 'Sécuriser les inscriptions + informer les acteurs en temps réel', { text: '✅ v1.1.0', bg: GREEN, bold: true, color: '2E7D32' }],
  ], [1000, 3800, 1000, 2800, 1480]),
  sp(),
  h2('6.2 Indicateurs de performance v1.0.0'),
  tbl(['Indicateur', 'Objectif', 'v1.0.0', 'v1.1.0 (actuel)'], [
    ['Couverture tests AuthService', '> 90%', '98.55%', { text: '98.55% ✅', bg: GREEN }],
    ['Couverture tests ProgramsService', '> 80%', '97.82%', { text: '97.82% ✅', bg: GREEN }],
    ['Couverture globale', '> 50%', '48.61%', { text: '48.61% ⚠', bg: ORANGE }],
    ['Scénarios recette PASS', '100%', '19/20 — 1 FAIL (BUG-07)', { text: '20/20 ✅ 100%', bg: GREEN, bold: true, color: '2E7D32' }],
    ['Vulnérabilités npm critiques', '0', '0', { text: '0 ✅', bg: GREEN }],
    ['Emails transactionnels', 'Vérification + notifications', 'Non implémenté', { text: 'Déployé ✅', bg: GREEN }],
  ], [3000, 2000, 2500, 2580]),
  sp(),
  h2('6.3 Retours utilisateurs'),
  p('Retours recueillis lors des tests utilisateurs (phase bêta interne, juillet 2026) :'),
  tbl(['Retour', 'Fréquence', 'Action associée'], [
    ['"La page reste bloquée quand je reviens après une longue pause"', 'Fréquent', 'AME-01 — BUG-07 correctif'],
    ['"Le chargement des exercices est lent au premier accès"', 'Occasionnel', 'AME-04 — pagination'],
    ['"Le message d\'erreur n\'est pas clair quand le mot de passe est mauvais"', 'Occasionnel', 'AME-05 — messages erreur'],
    ['"Je ne sais pas si mon programme a bien été envoyé"', 'Rare', 'Confirmation visuelle à ajouter v1.2.0'],
  ], [4000, 1800, 4280]),
  pb(),
];

// ══════════════════════════════════════════════════════════════════════════════
// §7 — JOURNAL DE VERSION (C4.3.2)
// ══════════════════════════════════════════════════════════════════════════════
const sec7 = [
  h1('§7 — Journal de Version  (C4.3.2)'),
  sp(),
  h2('7.1 Politique de versionnement — SemVer'),
  tbl(['Type', 'Format', 'Critère de déclenchement'], [
    ['PATCH', 'v1.0.x', 'Correction de bogue sans rupture de l\'API ou du schéma BDD'],
    ['MINOR', 'v1.x.0', 'Nouvelle fonctionnalité rétrocompatible'],
    ['MAJOR', 'v2.0.0', 'Rupture d\'API, refonte schéma BDD, changement d\'architecture'],
  ], [1600, 1600, 6880]),
  sp(),
  h2('7.2 v1.0.0 — Juillet 2026 (version courante)'),
  p('Tag Git : v1.0.0 — Branche : main — Date : 15 Juillet 2026', { bold: true }),
  sp(),
  h3('Fonctionnalités livrées'),
  tbl(['Fonctionnalité', 'Module', 'Description'], [
    ['Authentification JWT', 'AuthModule', 'Inscription, connexion, RBAC 3 rôles (ADMIN/COACH/CLIENT), bcrypt facteur 10'],
    ['Programme Builder', 'ProgramsModule', 'Création programme, jours workout/rest, catalogue exercices, ajout 1 clic'],
    ['Distribution programmes', 'ProgramsModule', 'Envoi programme au client, dashboard client avec accordéon'],
    ['Bibliothèque exercices', 'ExercisesModule', 'Seed 47 000+ exercices via AscendAPI, filtrage par groupe musculaire'],
    ['Demandes de coaching', 'RequestsModule', 'Formulaire public /apply/[slug], dashboard coach'],
    ['Administration', 'AdminModule', 'Liste utilisateurs, statistiques globales'],
    ['CI/CD', 'GitHub Actions', '4 jobs : backend-test, backend-build, frontend-build, security-audit'],
    ['Sécurité', 'Transversal', 'OWASP Top 10 couvert, Helmet, ThrottlerModule, ValidationPipe'],
  ], [2400, 2000, 5680]),
  sp(),
  h3('Bugs corrigés en v1.0.0'),
  tbl(['ID', 'Description', 'Correction appliquée'], [
    ['BUG-01', '"Data truncated for column slug"', 'Mise à jour colonnes NULL + ALTER TABLE TypeORM'],
    ['BUG-02', 'Mot de passe admin corrompu PowerShell', 'Reset Node.js + mysql2 paramètres préparés'],
    ['BUG-03', 'Seed : "Unknown column videoUrl"', 'ALTER TABLE manuel avant seed'],
    ['BUG-04', 'Seed ECONNRESET après 472 pages', 'MAX_PAGES=10, retry ×3 avec backoff exponentiel'],
    ['BUG-05', 'CORS bloquait toutes les requêtes', 'app.enableCors() avec FRONTEND_URL depuis .env'],
    ['BUG-06', 'Login silencieux quand Docker éteint', 'Message "Service indisponible" affiché en catch réseau'],
  ], [1400, 3200, 5480]),
  sp(),
  h3('Tests et qualité'),
  tbl(['Indicateur', 'Valeur'], [
    ['Tests unitaires', '33 tests — 4 suites (AuthController, AuthService, RolesGuard, ProgramsService)'],
    ['Couverture AuthService', '98.55% statements / 100% lines'],
    ['Couverture ProgramsService', '97.82% statements / 97.5% lines'],
    ['Scénarios recette', '19 PASS / 1 FAIL (BUG-07) — corrigé en v1.1.0'],
    ['Vulnérabilités npm', '0 critique'],
  ], [3000, 7080]),
  sp(),
  h2('7.3 v1.1.0 — Juillet 2026 (version courante)'),
  p('Tag Git : v1.1.0 — Branche : main — Date : 18 Juillet 2026', { bold: true }),
  sp(),
  h3('Corrections et améliorations livrées'),
  tbl(['Évolution', 'Type', 'ID', 'Statut'], [
    ['BUG-07 — Intercepteur Axios 401 + toast "session expirée" sur /login', 'Bug fix', 'AME-01', { text: '✅ DÉPLOYÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['Messages d\'erreur explicites dans tous les composants frontend', 'UX fix', 'AME-05', { text: '✅ DÉPLOYÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['Vérification email à l\'inscription — token UUID + email Nodemailer', 'Feature', 'AME-07', { text: '✅ DÉPLOYÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['Notification email au coach — nouvelle demande client reçue', 'Feature', 'AME-07', { text: '✅ DÉPLOYÉ', bg: GREEN, bold: true, color: '2E7D32' }],
    ['Notification email au client — programme envoyé par le coach', 'Feature', 'AME-07', { text: '✅ DÉPLOYÉ', bg: GREEN, bold: true, color: '2E7D32' }],
  ], [3800, 1200, 1200, 3880]),
  sp(),
  h3('Détail — Système email v1.1.0'),
  p('Architecture du système de notifications implémenté :'),
  tbl(['Déclencheur', 'Destinataire', 'Contenu email', 'Implémentation'], [
    ['POST /auth/register', 'Nouvel utilisateur', 'Lien de vérification (token UUID 32 hex)', 'AuthService.register() → MailService.sendVerificationEmail()'],
    ['GET /auth/verify-email?token=xxx', '—', 'Token validé → JWT retourné → accès accordé', 'AuthService.verifyEmail() — champ isVerified sur User entity'],
    ['POST /requests (client → coach)', 'Coach', '"[Ybuddy] Nouvelle demande de coaching reçue"', 'RequestsService.create() → MailService.sendCoachNewRequest()'],
    ['PATCH /programs/:id/send (coach → client)', 'Client', '"[Ybuddy] Votre programme est prêt !"', 'ProgramsService.sendToClient() → MailService.sendClientProgramReady()'],
  ], [2200, 1400, 2400, 4080]),
  sp(),
  h3('Tests et qualité v1.1.0'),
  tbl(['Indicateur', 'Valeur'], [
    ['Tests unitaires', '33 tests — aucune régression après correctifs'],
    ['Scénarios recette', '20 PASS / 0 FAIL — 100% (CR-AUTH-05 désormais PASS)'],
    ['Vulnérabilités npm', '0 critique'],
  ], [3000, 7080]),
  sp(),
  h2('7.4 v1.2.0 — Planifiée Q4 2026'),
  p('Tag Git : v1.2.0 (planifiée) — Branche cible : develop', { bold: true }),
  sp(),
  tbl(['Évolution', 'Type', 'Compétence liée'], [
    ['Intégration Sentry — monitoring erreurs production', 'Feature', 'C4.1.2 / A09 OWASP'],
    ['Pagination cursor-based GET /exercises', 'Feature', 'Performance'],
    ['Tests e2e NestJS + MariaDB de test en CI', 'Qualité', 'C4.2.2'],
    ['Vitest + React Testing Library (frontend)', 'Qualité', 'C2.2.2'],
    ['Déploiement VPS (OVH) — production publique', 'Infra', 'C4.1.2'],
  ], [3800, 1600, 4680]),
  pb(),
];

// ══════════════════════════════════════════════════════════════════════════════
// §8 — COLLABORATION SUPPORT CLIENT (C4.3.3)
// ══════════════════════════════════════════════════════════════════════════════
const sec8 = [
  h1('§8 — Collaboration avec le Support Client  (C4.3.3)'),
  sp(),
  h2('8.1 Contexte du retour client'),
  p('Date : 10 Juillet 2026 — Semaine suivant la mise en production de v1.0.0.'),
  sp(),
  p('Un coach utilisateur (identifié comme "Coach Martin") signale via email au support qu\'il ne peut pas se connecter à l\'application depuis plusieurs heures. Il décrit le problème ainsi :'),
  sp(),
  new Paragraph({
    children: [new TextRun({ text: '"J\'essaie de me connecter depuis ce matin mais ça ne marche pas. La page de login charge mais quand je valide mes identifiants, rien ne se passe. J\'ai pourtant le bon email et mot de passe."', size: 20, italics: true, color: MUTED, font: 'Calibri' })],
    indent: { left: 600 },
    spacing: { before: 80, after: 80 },
    border: { left: { style: BorderStyle.SINGLE, size: 8, color: ACCENT } },
  }),
  sp(),
  h2('8.2 Diagnostic et résolution'),
  h3('Étape 1 — Réception et qualification (Support → Dev)'),
  p('Le support client transfère le signalement à l\'équipe de développement avec les informations suivantes :'),
  bullet('Compte concerné : martin.coach@ybuddy.fr'),
  bullet('Heure de début : ~09h00 le 10/07/2026'),
  bullet('Navigateur : Chrome 126, Windows 11'),
  bullet('Message d\'erreur visible par le coach : aucun (page reste en attente)'),
  sp(),
  h3('Étape 2 — Investigation technique (Dev)'),
  p('Consultation des logs NestJS du serveur de production :'),
  p('[ExceptionFilter] ERROR — POST /api/auth/login — DriverPackageNotInstalledError: MariaDB package not found', { font: 'Courier New', color: 'C62828' }),
  sp(),
  p('Cause identifiée : le service Docker MariaDB s\'est arrêté suite à un redémarrage système inattendu du VPS. Le backend NestJS ne pouvait pas établir de connexion à la base de données. Toutes les requêtes nécessitant la BDD (dont /login) échouaient silencieusement du point de vue utilisateur.'),
  sp(),
  h3('Étape 3 — Correctif immédiat (Dev)'),
  numbered(1, 'Connexion SSH au serveur de production'),
  numbered(2, 'docker compose up -d → redémarrage du conteneur ybuddy_db'),
  numbered(3, 'Vérification : docker ps → MariaDB "Up 30 seconds"'),
  numbered(4, 'Test : POST /api/auth/login → HTTP 200 + JWT retourné'),
  p('Temps de résolution : 12 minutes après réception du signalement.', { bold: true }),
  sp(),
  h3('Étape 4 — Communication au support et au client'),
  p('Le support client informe Coach Martin :'),
  new Paragraph({
    children: [new TextRun({ text: '"Bonjour, nous avons identifié et résolu le problème. Un redémarrage serveur inattendu avait interrompu la base de données. L\'application est de nouveau pleinement opérationnelle. Nous vous prions de nous excuser pour la gêne occasionnée."', size: 20, italics: true, color: MUTED, font: 'Calibri' })],
    indent: { left: 600 },
    spacing: { before: 80, after: 80 },
    border: { left: { style: BorderStyle.SINGLE, size: 8, color: ACCENT } },
  }),
  sp(),
  h2('8.3 Contribution des parties prenantes'),
  tbl(['Partie prenante', 'Rôle', 'Contribution'], [
    ['Coach Martin (client)', 'Signalement', 'Description précise du comportement observé, disponibilité pour test de vérification'],
    ['Support client', 'Interface', 'Qualification initiale du ticket, transmission au dev avec contexte, retour au client'],
    ['Développement (Rawan Atwe)', 'Résolution', 'Analyse logs, identification cause racine, correctif immédiat, documentation'],
  ], [2400, 1600, 6080]),
  sp(),
  h2('8.4 Actions préventives mises en place'),
  p('Suite à cet incident, deux actions préventives ont été déployées :'),
  bullet('Ajout de restart: unless-stopped sur le service MariaDB dans docker-compose.yml → redémarrage automatique du conteneur après un reboot système'),
  bullet('Amélioration du message d\'erreur frontend (BUG-06 / AME-05) : affichage de "Service temporairement indisponible" au lieu d\'un écran vide quand l\'API ne répond pas'),
  sp(),
  tbl(['Amélioration', 'Implémentation', 'Statut'], [
    ['restart: unless-stopped Docker', 'docker-compose.yml — service db', { text: '✅ Déployé v1.0.0', bg: GREEN }],
    ['Message erreur connexion BDD', 'Frontend catch réseau → toast "Service indisponible"', { text: '✅ Déployé v1.0.0', bg: GREEN }],
    ['Monitoring disponibilité automatique', 'UptimeRobot + Sentry', { text: '🔄 Planifié v1.1.0', bg: ORANGE }],
  ], [2800, 3600, 3680]),
];

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 20, color: TEXT } },
    },
  },
  sections: [{
    properties: pageProps,
    children: [
      ...cover, ...sec1, ...sec2, ...sec3, ...sec4,
      ...sec5, ...sec6, ...sec7, ...sec8,
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('dossier-bloc4.docx', buf);
  console.log('✅ dossier-bloc4.docx généré avec succès');
});
