import type { BjdLevel, BjdRecord, FilterOptions } from '../types/index.js';

/** 시도 필터링 */
export function filterSido(records: BjdRecord[], options?: FilterOptions): BjdRecord[] {
  return filterByLevel(records, 'sido', options);
}

/** 시군구 필터링 */
export function filterSigungu(records: BjdRecord[], options?: FilterOptions): BjdRecord[] {
  return filterByLevel(records, 'sigungu', options);
}

/** 읍면동 필터링 */
export function filterEupmyeondong(records: BjdRecord[], options?: FilterOptions): BjdRecord[] {
  return filterByLevel(records, 'eupmyeondong', options);
}

/** 리 필터링 */
export function filterRi(records: BjdRecord[], options?: FilterOptions): BjdRecord[] {
  return filterByLevel(records, 'ri', options);
}

/** 레벨별 필터링 (단일 순회) */
export function filterByLevel(
  records: BjdRecord[],
  level: BjdLevel,
  options?: FilterOptions,
): BjdRecord[] {
  const includeInactive = options?.includeInactive ?? false;
  return records.filter((r) => r.level === level && (includeInactive || r.isActive));
}

/** 이름 부분 검색 (단일 순회) */
export function searchByName(
  records: BjdRecord[],
  query: string,
  options?: FilterOptions,
): BjdRecord[] {
  const q = query.trim();
  if (!q) return [];
  const includeInactive = options?.includeInactive ?? false;
  return records.filter((r) => r.name.includes(q) && (includeInactive || r.isActive));
}
