#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { Command, InvalidArgumentError } from 'commander';
import { parseCSV } from '../core/parser.js';
import { filterByLevel, searchByName } from '../core/filter.js';
import { buildTree } from '../core/tree.js';
import { downloadCSV, MANUAL_INSTRUCTIONS } from '../core/download.js';
import type { BjdLevel, FilterOptions } from '../types/index.js';

const VALID_LEVELS: BjdLevel[] = ['sido', 'sigungu', 'eupmyeondong', 'ri'];

function parseLevel(value: string): BjdLevel {
  if (!VALID_LEVELS.includes(value as BjdLevel)) {
    throw new InvalidArgumentError(
      `유효하지 않은 레벨: "${value}" (가능한 값: ${VALID_LEVELS.join(', ')})`,
    );
  }
  return value as BjdLevel;
}

const program = new Command();

program
  .name('bjd')
  .description('법정동 코드 파싱/필터링/트리 구조화 CLI')
  .version('0.1.0');

interface CommonOpts {
  file?: string;
  includeInactive?: boolean;
  pretty?: boolean;
  output?: string;
  encoding?: string;
}

function output(data: unknown, opts: CommonOpts) {
  const json = opts.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  if (opts.output) {
    writeFileSync(opts.output, json, 'utf-8');
    console.log(`결과가 ${opts.output}에 저장되었습니다.`);
  } else {
    console.log(json);
  }
}

function addCommonOptions(cmd: Command): Command {
  return cmd
    .option('-f, --file <path>', 'CSV 파일 경로 (기본: ~/.bjd-code/data.csv)')
    .option('--include-inactive', '폐지된 코드 포함', false)
    .option('--pretty', 'JSON 예쁘게 출력', false)
    .option('-o, --output <file>', '결과를 파일로 저장')
    .option('--encoding <encoding>', 'CSV 인코딩', 'euc-kr');
}

function handleError(err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`오류: ${message}`);
  process.exit(1);
}

program
  .command('download')
  .description('법정동 코드 CSV 다운로드')
  .option('--url <url>', '다운로드 URL 직접 지정')
  .option('-o, --output <path>', '저장 경로 (기본: ~/.bjd-code/data.csv)')
  .action(async (opts: { url?: string; output?: string }) => {
    try {
      console.log('다운로드 중...');
      const savedPath = await downloadCSV({ url: opts.url, outputPath: opts.output });
      console.log(`저장 완료: ${savedPath}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`다운로드 실패: ${message}`);
      console.error(`\n수동 다운로드 방법:\n${MANUAL_INSTRUCTIONS}`);
      process.exit(1);
    }
  });

addCommonOptions(
  program
    .command('parse')
    .description('CSV 파일을 파싱하여 전체 데이터 JSON 출력'),
).action(async (opts: CommonOpts) => {
  try {
    const records = await parseCSV({ filePath: opts.file, encoding: opts.encoding, useWorker: false });
    const result = opts.includeInactive ? records : records.filter((r) => r.isActive);
    output(result, opts);
  } catch (err) {
    handleError(err);
  }
});

addCommonOptions(
  program
    .command('filter')
    .description('레벨별 필터링')
    .requiredOption('--level <level>', '필터 레벨 (sido, sigungu, eupmyeondong, ri)', parseLevel),
).action(async (opts: CommonOpts & { level: BjdLevel }) => {
  try {
    const records = await parseCSV({ filePath: opts.file, encoding: opts.encoding, useWorker: false });
    const filterOpts: FilterOptions = { includeInactive: opts.includeInactive };
    const result = filterByLevel(records, opts.level, filterOpts);
    output(result, opts);
  } catch (err) {
    handleError(err);
  }
});

addCommonOptions(
  program
    .command('tree')
    .description('트리 구조 JSON 출력'),
).action(async (opts: CommonOpts) => {
  try {
    const records = await parseCSV({ filePath: opts.file, encoding: opts.encoding, useWorker: false });
    const active = opts.includeInactive ? records : records.filter((r) => r.isActive);
    const tree = buildTree(active);
    output(tree, opts);
  } catch (err) {
    handleError(err);
  }
});

addCommonOptions(
  program
    .command('search <query>')
    .description('이름으로 검색'),
).action(async (query: string, opts: CommonOpts) => {
  try {
    const records = await parseCSV({ filePath: opts.file, encoding: opts.encoding, useWorker: false });
    const filterOpts: FilterOptions = { includeInactive: opts.includeInactive };
    const result = searchByName(records, query, filterOpts);
    output(result, opts);
  } catch (err) {
    handleError(err);
  }
});

program.parse();
