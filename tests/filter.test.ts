import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'node:path';
import { parseCSV } from '../src/core/parser.js';
import {
  filterSido,
  filterSigungu,
  filterEupmyeondong,
  filterRi,
  filterByLevel,
  searchByName,
} from '../src/core/filter.js';
import type { BjdRecord } from '../src/types/index.js';

const FIXTURE_PATH = resolve(import.meta.dirname, 'fixtures/sample.csv');

let allRecords: BjdRecord[];

beforeAll(async () => {
  allRecords = await parseCSV({
    filePath: FIXTURE_PATH,
    encoding: 'utf-8',
    useWorker: false,
  });
});

describe('filterSido', () => {
  it('시도만 필터링한다', () => {
    const result = filterSido(allRecords);
    expect(result.length).toBe(4); // 서울, 부산, 경기, 충북
    expect(result.every((r) => r.level === 'sido')).toBe(true);
  });
});

describe('filterSigungu', () => {
  it('시군구만 필터링한다', () => {
    const result = filterSigungu(allRecords);
    expect(result.every((r) => r.level === 'sigungu')).toBe(true);
  });
});

describe('filterEupmyeondong', () => {
  it('읍면동만 필터링한다', () => {
    const result = filterEupmyeondong(allRecords);
    expect(result.every((r) => r.level === 'eupmyeondong')).toBe(true);
    // 폐지된 통의동은 기본적으로 제외
    expect(result.find((r) => r.name.includes('통의동'))).toBeUndefined();
  });

  it('includeInactive 옵션으로 폐지된 코드를 포함한다', () => {
    const result = filterEupmyeondong(allRecords, { includeInactive: true });
    expect(result.find((r) => r.name.includes('통의동'))).toBeDefined();
  });
});

describe('filterRi', () => {
  it('리만 필터링한다', () => {
    const result = filterRi(allRecords);
    expect(result.length).toBe(3); // 송산리, 율리, 남하리
    expect(result.every((r) => r.level === 'ri')).toBe(true);
  });
});

describe('filterByLevel', () => {
  it('레벨별로 필터링한다', () => {
    const sidos = filterByLevel(allRecords, 'sido');
    expect(sidos.length).toBe(4);

    const ris = filterByLevel(allRecords, 'ri');
    expect(ris.length).toBe(3);
  });
});

describe('searchByName', () => {
  it('이름으로 검색한다', () => {
    const result = searchByName(allRecords, '종로구');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.name.includes('종로구'))).toBe(true);
  });

  it('빈 쿼리는 빈 배열을 반환한다', () => {
    expect(searchByName(allRecords, '')).toEqual([]);
    expect(searchByName(allRecords, '  ')).toEqual([]);
  });

  it('폐지된 코드는 기본적으로 제외된다', () => {
    const result = searchByName(allRecords, '통의동');
    expect(result.length).toBe(0);
  });

  it('includeInactive로 폐지된 코드를 포함한다', () => {
    const result = searchByName(allRecords, '통의동', { includeInactive: true });
    expect(result.length).toBe(1);
  });
});
