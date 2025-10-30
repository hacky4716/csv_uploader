import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from './config.js';
import { setNested } from './utils.js';
import { pool } from './db.js';
export function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (!inQuotes) {
      if (ch === '"') { inQuotes = true; continue; }
      if (ch === ',') { fields.push(cur); cur = ''; continue; }
      cur += ch;
    } else {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; continue; }
        inQuotes = false; continue;
      } else { cur += ch; }
    }
  }
  fields.push(cur);
  return fields;
}


function setNestedByRoot(target, fullKey, value) {
  const parts = fullKey.split('.');
  setNested(target, parts, value);
}


function mapRowToDbRow(headers, values) {
  // mandatory mapping
  const mandatory = {};
  const addressObj = {};
  const additional = {};


  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].trim();
    const raw = values[i] === undefined ? '' : values[i];
    const v = raw === '' ? null : raw.trim();


    if (h === 'name.firstName') mandatory.firstName = v;
    else if (h === 'name.lastName') mandatory.lastName = v;
    else if (h === 'age') {
      const n = v === null ? null : parseInt(v, 10);
      mandatory.age = Number.isNaN(n) ? null : n;
    } else if (h.startsWith('address.')) {
      const sub = h.slice('address.'.length);
      setNestedByRoot(addressObj, sub, v);
    } else {
      setNestedByRoot(additional, h, v);
    }
  } return {
    name: `${mandatory.firstName || ''} ${mandatory.lastName || ''}`.trim(),
    age: mandatory.age,
    address: Object.keys(addressObj).length ? addressObj : null,
    additional_info: Object.keys(additional).length ? additional : null,
  };
}


export async function processCsvStream(filePath) {
  if (!fs.existsSync(filePath)) throw new Error('CSV file not found: ' + filePath);


  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });


  let headers = null;
  const batch = [];
  const batchSize = config.batchSize || 500;
  let lineNumber = 0;
  let inserted = 0;


  for await (const rawLine of rl) {
    lineNumber++;
    if (rawLine.trim() === '') continue;
    if (!headers) {
      headers = parseCSVLine(rawLine).map(h => h.trim());
      // validate mandatory headers
      if (!headers.includes('name.firstName') || !headers.includes('name.lastName') || !headers.includes('age')) {
        throw new Error('Missing mandatory headers: name.firstName, name.lastName, age');
      }
      continue;
    }


    const values = parseCSVLine(rawLine);
    const row = mapRowToDbRow(headers, values);


    if (!row.name || row.age === null) {
      console.warn(`Skipping line ${lineNumber}: missing mandatory fields`);
      continue;
    }


    batch.push(row);


    if (batch.length >= batchSize) {
      await insertBatch(batch);
      inserted += batch.length;
      batch.length = 0;
    }
  }


  if (batch.length) {
    await insertBatch(batch);
    inserted += batch.length;
  }


  return inserted;
} async function insertBatch(rows) {
  if (!rows.length) return;
  const cols = ['"name"', 'age', 'address', 'additional_info'];
  const placeholders = [];
  const values = [];


  rows.forEach((r, i) => {
    const base = i * cols.length;
    placeholders.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4})`);
    values.push(r.name, r.age, r.address ? JSON.stringify(r.address) : null, r.additional_info ? JSON.stringify(r.additional_info) : null);
  });


  const sql = `INSERT INTO public.users (${cols.join(',')}) VALUES ${placeholders.join(',')};`;
  await pool.query(sql, values);
}