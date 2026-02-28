import { parentPort, workerData } from 'node:worker_threads';
import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';
import iconv from 'iconv-lite';
import type { BjdRecord, RawBjdRow, WorkerData, WorkerMessage } from '../types/index.js';
import { normalizeRow } from '../utils/normalize.js';

const { filePath, encoding } = workerData as WorkerData;

const records: BjdRecord[] = [];

const fileStream = createReadStream(filePath);
const decoder = encoding.toLowerCase() === 'utf-8' || encoding.toLowerCase() === 'utf8'
  ? fileStream
  : fileStream.pipe(iconv.decodeStream(encoding));

const parser = parse({
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true,
});

decoder.pipe(parser);

parser.on('data', (row: RawBjdRow) => {
  const record = normalizeRow(row);
  if (record) {
    records.push(record);
  }
});

parser.on('end', () => {
  const msg: WorkerMessage = { type: 'result', data: records };
  parentPort!.postMessage(msg);
});

parser.on('error', (err: Error) => {
  const msg: WorkerMessage = { type: 'error', message: err.message };
  parentPort!.postMessage(msg);
});
