import dotenv from 'dotenv';
dotenv.config();


export const config = {
  port: process.env.PORT || 5000,
  csvPath: process.env.CSV_FILE_PATH || './data.csv',
  db: {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
  },
  batchSize: parseInt(process.env.BATCH_SIZE || '500', 10),
};