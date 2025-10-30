import express from 'express';
import { config } from './config.js';
import { initDB } from './db.js';
import { processCsvStream } from './csvParser.js';
import { getAgeGroupStats } from './statsController.js';


const app = express();
app.use(express.json());


await initDB();


app.post('/upload', async (req, res) => {
  try {
    const inserted = await processCsvStream(config.csvPath);
    console.log('All records inserted.');
    // compute & print distribution to console
    const stats = await getAgeGroupStatsInternal();
    console.log('\n Age-Group % Distribution');
    console.log(`< 20 : ${stats.under20.pct}%`);
    console.log(`20 to 40 : ${stats.between20and40.pct}%`);
    console.log(`40 to 60 : ${stats.between40and60.pct}%`);
    console.log(`> 60 : ${stats.over60.pct}%`);


    res.json({ message: 'CSV uploaded and processed successfully!', inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/stats', getAgeGroupStats);


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// internal helper to compute distribution used after upload
import { pool } from './db.js';
async function getAgeGroupStatsInternal() {
  const sql = `SELECT
count(*) FILTER (WHERE age < 20) as under20,
count(*) FILTER (WHERE age >= 20 AND age < 40) as between20and40,
count(*) FILTER (WHERE age >= 40 AND age < 60) as between40and60,
count(*) FILTER (WHERE age >= 60) as over60,
count(*) as total
FROM public.users;`;
  const { rows } = await pool.query(sql);
  const r = rows[0];
  const total = parseInt(r.total, 10) || 0;
  const toPct = (n) => (total === 0 ? 0 : Math.round((n * 100) / total));
  return {
    total,
    under20: { count: parseInt(r.under20, 10) || 0, pct: toPct(parseInt(r.under20, 10) || 0) },
    between20and40: { count: parseInt(r.between20and40, 10) || 0, pct: toPct(parseInt(r.between20and40, 10) || 0) },
    between40and60: { count: parseInt(r.between40and60, 10) || 0, pct: toPct(parseInt(r.between40and60, 10) || 0) },
    over60: { count: parseInt(r.over60, 10) || 0, pct: toPct(parseInt(r.over60, 10) || 0) },
  };
}