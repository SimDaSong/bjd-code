import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

/** 기본 데이터 디렉토리 (~/.bjd-code/) */
export const DATA_DIR = join(homedir(), '.bjd-code');

/** 기본 CSV 파일 경로 */
export const DEFAULT_CSV_PATH = join(DATA_DIR, 'data.csv');

/** 기본 CSV 파일이 존재하는지 확인 */
export function hasDefaultData(): boolean {
  return existsSync(DEFAULT_CSV_PATH);
}

/**
 * 파일 경로를 결정한다.
 * 명시적 경로가 있으면 그대로 사용, 없으면 기본 경로 사용.
 * 기본 경로에 파일이 없으면 에러.
 */
export function resolveDataPath(filePath?: string): string {
  if (filePath) return filePath;
  if (hasDefaultData()) return DEFAULT_CSV_PATH;
  throw new Error(
    '데이터 파일을 찾을 수 없습니다. 먼저 `bjd download`를 실행하거나 CSV 파일 경로를 지정하세요.',
  );
}
