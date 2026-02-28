import { Worker } from 'node:worker_threads';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse';
import iconv from 'iconv-lite';
import type {
  BjdRecord,
  ParseOptions,
  RawBjdRow,
  WorkerData,
  WorkerMessage,
} from '../types/index.js';
import { normalizeRow } from '../utils/normalize.js';
import { resolveDataPath } from '../utils/paths.js';

export { normalizeRow } from '../utils/normalize.js';

// vitest에서는 .ts 소스를 실행하므로 dist/ 경로로 우회
const isSource = import.meta.url.endsWith('.ts');
const WORKER_PATH = isSource
  ? new URL('../../dist/worker/csv-worker.js', import.meta.url)
  : new URL('../worker/csv-worker.js', import.meta.url);

/** 메인 스레드에서 CSV 파싱 (폴백) */
async function parseInMainThread(filePath: string, encoding: string): Promise<BjdRecord[]> {
  return new Promise((resolve, reject) => {
    const records: BjdRecord[] = [];

    const fileStream = createReadStream(filePath);
    const decoder =
      encoding.toLowerCase() === 'utf-8' || encoding.toLowerCase() === 'utf8'
        ? fileStream
        : fileStream.pipe(iconv.decodeStream(encoding));

    const csvParser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });

    decoder.pipe(csvParser);

    csvParser.on('data', (row: RawBjdRow) => {
      const record = normalizeRow(row);
      if (record) {
        records.push(record);
      }
    });
    csvParser.on('end', () => resolve(records));
    csvParser.on('error', reject);
  });
}

/** Worker를 사용하여 CSV 파싱 */
async function parseWithWorker(filePath: string, encoding: string): Promise<BjdRecord[]> {
  return new Promise((resolve, reject) => {
    const workerDataPayload: WorkerData = { filePath, encoding };
    const worker = new Worker(fileURLToPath(WORKER_PATH), {
      workerData: workerDataPayload,
    });

    worker.on('message', (msg: WorkerMessage) => {
      if (msg.type === 'result') {
        resolve(msg.data);
      } else {
        reject(new Error(msg.message));
      }
    });

    worker.on('error', reject);
    worker.on('exit', (exitCode) => {
      if (exitCode !== 0) {
        reject(new Error(`Worker exited with code ${exitCode}`));
      }
    });
  });
}

/** CSV 파싱 → BjdRecord[] */
export async function parseCSV(options?: ParseOptions): Promise<BjdRecord[]> {
  const { filePath, encoding = 'euc-kr', useWorker = true } = options ?? {};
  const resolved = resolveDataPath(filePath);

  return useWorker
    ? parseWithWorker(resolved, encoding)
    : parseInMainThread(resolved, encoding);
}
