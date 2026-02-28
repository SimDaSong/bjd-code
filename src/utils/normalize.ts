import type { BjdRecord, RawBjdRow } from '../types/index.js';
import {
  extractSidoCode,
  extractSigunguCode,
  extractEupmyeondongCode,
  extractRiCode,
  determineLevel,
  isValidCode,
} from './code.js';

/** RawBjdRow → BjdRecord 변환 */
export function normalizeRow(row: RawBjdRow): BjdRecord | null {
  const code = row.법정동코드.trim();
  if (!isValidCode(code)) return null;

  const name = row.법정동명.trim();
  const names = name.split(/\s+/).filter(Boolean);

  return {
    code,
    sidoCode: extractSidoCode(code),
    sigunguCode: extractSigunguCode(code),
    eupmyeondongCode: extractEupmyeondongCode(code),
    riCode: extractRiCode(code),
    name,
    names,
    level: determineLevel(code),
    isActive: row.폐지여부.trim() === '존재',
  };
}
