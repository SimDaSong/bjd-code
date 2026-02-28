import type { BjdLevel } from '../types/index.js';

/**
 * 10자리 코드에서 시도 코드(1-2자리) 추출
 */
export function extractSidoCode(code: string): string {
  return code.substring(0, 2);
}

/**
 * 10자리 코드에서 시군구 코드(3-5자리) 추출
 */
export function extractSigunguCode(code: string): string {
  return code.substring(2, 5);
}

/**
 * 10자리 코드에서 읍면동 코드(6-8자리) 추출
 */
export function extractEupmyeondongCode(code: string): string {
  return code.substring(5, 8);
}

/**
 * 10자리 코드에서 리 코드(9-10자리) 추출
 */
export function extractRiCode(code: string): string {
  return code.substring(8, 10);
}

/**
 * 뒷자리 0 패턴으로 행정 레벨 판단
 * - 시도: XX00000000 (3~10자리 모두 0)
 * - 시군구: XXXXX00000 (6~10자리 모두 0)
 * - 읍면동: XXXXXXXX00 (9~10자리 모두 0)
 * - 리: XXXXXXXXXX (0이 아닌 9~10자리)
 */
export function determineLevel(code: string): BjdLevel {
  const sigungu = code.substring(2, 5);
  const eupmyeondong = code.substring(5, 8);
  const ri = code.substring(8, 10);

  if (sigungu === '000' && eupmyeondong === '000' && ri === '00') {
    return 'sido';
  }
  if (eupmyeondong === '000' && ri === '00') {
    return 'sigungu';
  }
  if (ri === '00') {
    return 'eupmyeondong';
  }
  return 'ri';
}

/**
 * 코드 유효성 검증 (10자리 숫자)
 */
export function isValidCode(code: string): boolean {
  return /^\d{10}$/.test(code);
}

/**
 * 부모 코드 계산 (상위 레벨의 전체 10자리 코드)
 */
export function getParentCode(code: string, level: BjdLevel): string | null {
  switch (level) {
    case 'sido':
      return null;
    case 'sigungu':
      return code.substring(0, 2) + '00000000';
    case 'eupmyeondong':
      return code.substring(0, 5) + '00000';
    case 'ri':
      return code.substring(0, 8) + '00';
  }
}
