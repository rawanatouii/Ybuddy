/**
 * Seed des exercices via AscendAPI (EDB with videos and images)
 * Lance : node seed-exercises.js
 */

const https = require('https');
const mysql = require('mysql2/promise');
require('dotenv').config();

const RAPIDAPI_KEY = '9d57e954e6msh0976dc6ce233e55p1c0503jsn50b6b5b1c540';
const API_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';

const MUSCLE_MAP = {
  CHEST: 'chest',
  BACK: 'back',
  SHOULDERS: 'shoulders',
  'UPPER ARMS': 'arms',
  'LOWER ARMS': 'arms',
  ARMS: 'arms',
  QUADRICEPS: 'legs',
  THIGHS: 'legs',
  'UPPER LEGS': 'legs',
  'LOWER LEGS': 'legs',
  CALVES: 'legs',
  GLUTES: 'glutes',
  WAIST: 'core',
  CORE: 'core',
  ABS: 'core',
  CARDIO: 'cardio',
  NECK: 'full_body',
  'FULL BODY': 'full_body',
};

function resolveMuscleGroup(bodyParts = []) {
  for (const bp of bodyParts) {
    const mapped = MUSCLE_MAP[bp.toUpperCase()];
    if (mapped) return mapped;
  }
  return 'full_body';
}

function apiGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: 'GET',
        hostname: API_HOST,
        path,
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': API_HOST,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('JSON parse error: ' + data)); }
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USERNAME || 'ybuddy',
    password: process.env.DB_PASSWORD || 'ybuddy_pass',
    database: process.env.DB_DATABASE || 'ybuddy_db',
  });

  console.log('✅ Connecté à la base de données\n');

  // Étape 1 : récupérer les IDs (max MAX_PAGES pages)
  const MAX_PAGES = 2; // 2 pages × 100 = 200 exercices, suffisant pour la démo
  const allExercises = [];
  let cursor = null;
  let page = 1;

  do {
    const path = cursor
      ? `/api/v1/exercises?limit=100&cursor=${cursor}`
      : `/api/v1/exercises?limit=100`;

    console.log(`📄 Récupération liste page ${page}/${MAX_PAGES}...`);
    const res = await apiGet(path);

    if (!res.success || !Array.isArray(res.data)) {
      console.error('❌ Réponse inattendue :', res);
      break;
    }

    allExercises.push(...res.data);
    cursor = res.meta?.nextCursor || null;
    page++;
    if (cursor) await sleep(300);
  } while (cursor && page <= MAX_PAGES);

  console.log(`\n📋 ${allExercises.length} exercices trouvés. Récupération des détails...\n`);

  // Étape 2 : appeler le détail de chaque exercice pour la vidéo
  let total = 0;

  for (let i = 0; i < allExercises.length; i++) {
    const ex = allExercises[i];
    console.log(`[${i + 1}/${allExercises.length}] ${ex.name.trim()}`);

    let detail;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await apiGet(`/api/v1/exercises/${ex.exerciseId}`);
        detail = res.data;
        break;
      } catch (err) {
        console.error(`  ✗ Tentative ${attempt}/3 échouée : ${err.message}`);
        if (attempt < 3) await sleep(1000 * attempt);
        else detail = ex; // fallback sur les données de liste
      }
    }

    const muscleGroup = resolveMuscleGroup(detail.bodyParts || ex.bodyParts);

    const description = [
      detail.overview || null,
      detail.targetMuscles?.length ? `Muscles ciblés : ${detail.targetMuscles.join(', ')}` : null,
      detail.equipments?.length ? `Équipement : ${detail.equipments.join(', ')}` : null,
    ].filter(Boolean).join('\n\n');

    const instructions = Array.isArray(detail.instructions)
      ? detail.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')
      : null;

    try {
      await db.execute(
        `INSERT IGNORE INTO exercises (name, muscleGroup, gifUrl, videoUrl, description, instructions)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          detail.name.trim(),
          muscleGroup,
          detail.imageUrl || ex.imageUrl || null,
          detail.videoUrl || null,
          description || null,
          instructions || null,
        ],
      );
      total++;
      console.log(`  ✓ [${muscleGroup}] vidéo: ${detail.videoUrl ? 'oui' : 'non'}`);
    } catch (err) {
      console.error(`  ✗ Erreur insert : ${err.message}`);
    }

    // Pause pour éviter le rate limit (plan gratuit)
    await sleep(400);
  }

  await db.end();
  console.log(`\n🎉 Terminé ! ${total} exercices insérés.`);
}

main().catch((err) => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
