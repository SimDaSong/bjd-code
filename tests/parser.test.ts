import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { normalizeRow } from '../src/core/parser.js';
import { parseCSV } from '../src/core/parser.js';
import type { RawBjdRow } from '../src/types/index.js';

const FIXTURE_PATH = resolve(import.meta.dirname, 'fixtures/sample.csv');

describe('normalizeRow', () => {
  it('RawBjdRow를 BjdRecord로 변환한다', () => {
    const raw: RawBjdRow = {
      법정동코드: '1111010100',
      법정동명: '서울특별시 종로구 청운동',
      폐지여부: '존재',
    };
    const record = normalizeRow(raw);
    expect(record).not.toBeNull();
    expect(record!.code).toBe('1111010100');
    expect(record!.sidoCode).toBe('11');
    expect(record!.sigunguCode).toBe('110');
    expect(record!.eupmyeondongCode).toBe('101');
    expect(record!.riCode).toBe('00');
    expect(record!.name).toBe('서울특별시 종로구 청운동');
    expect(record!.names).toEqual(['서울특별시', '종로구', '청운동']);
    expect(record!.level).toBe('eupmyeondong');
    expect(record!.isActive).toBe(true);
  });

  it('폐지된 코드를 처리한다', () => {
    const raw: RawBjdRow = {
      법정동코드: '1111011100',
      법정동명: '서울특별시 종로구 통의동',
      폐지여부: '폐지',
    };
    const record = normalizeRow(raw);
    expect(record!.isActive).toBe(false);
  });

  it('유효하지 않은 코드는 null을 반환한다', () => {
    const raw: RawBjdRow = {
      법정동코드: 'invalid',
      법정동명: '테스트',
      폐지여부: '존재',
    };
    expect(normalizeRow(raw)).toBeNull();
  });
});

describe('parseCSV', () => {
  it('CSV 파일을 파싱하여 BjdRecord[]를 반환한다 (메인 스레드)', async () => {
    const records = await parseCSV({
      filePath: FIXTURE_PATH,
      encoding: 'utf-8',
      useWorker: false,
    });
    expect(records.length).toBe(24);
    expect(records[0].code).toBe('1100000000');
    expect(records[0].level).toBe('sido');
    expect(records[0].name).toBe('서울특별시');
  });

  it('Worker를 사용하여 CSV 파일을 파싱한다', async () => {
    const records = await parseCSV({
      filePath: FIXTURE_PATH,
      encoding: 'utf-8',
      useWorker: true,
    });
    expect(records.length).toBe(24);
    expect(records[0].code).toBe('1100000000');
  });
});
