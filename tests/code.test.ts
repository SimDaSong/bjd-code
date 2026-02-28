import { describe, it, expect } from 'vitest';
import {
  extractSidoCode,
  extractSigunguCode,
  extractEupmyeondongCode,
  extractRiCode,
  determineLevel,
  isValidCode,
  getParentCode,
} from '../src/utils/code.js';

describe('code utils', () => {
  describe('extractSidoCode', () => {
    it('시도 코드를 추출한다', () => {
      expect(extractSidoCode('1100000000')).toBe('11');
      expect(extractSidoCode('2600000000')).toBe('26');
    });
  });

  describe('extractSigunguCode', () => {
    it('시군구 코드를 추출한다', () => {
      expect(extractSigunguCode('1111000000')).toBe('110');
      expect(extractSigunguCode('1114000000')).toBe('140');
    });
  });

  describe('extractEupmyeondongCode', () => {
    it('읍면동 코드를 추출한다', () => {
      expect(extractEupmyeondongCode('1111010100')).toBe('101');
      expect(extractEupmyeondongCode('4372025000')).toBe('250');
    });
  });

  describe('extractRiCode', () => {
    it('리 코드를 추출한다', () => {
      expect(extractRiCode('4372025021')).toBe('21');
      expect(extractRiCode('1100000000')).toBe('00');
    });
  });

  describe('determineLevel', () => {
    it('시도 레벨을 판단한다', () => {
      expect(determineLevel('1100000000')).toBe('sido');
      expect(determineLevel('4300000000')).toBe('sido');
    });

    it('시군구 레벨을 판단한다', () => {
      expect(determineLevel('1111000000')).toBe('sigungu');
      expect(determineLevel('4113100000')).toBe('sigungu');
    });

    it('읍면동 레벨을 판단한다', () => {
      expect(determineLevel('1111010100')).toBe('eupmyeondong');
      expect(determineLevel('4372025000')).toBe('eupmyeondong');
    });

    it('리 레벨을 판단한다', () => {
      expect(determineLevel('4372025021')).toBe('ri');
      expect(determineLevel('4372025022')).toBe('ri');
    });
  });

  describe('isValidCode', () => {
    it('유효한 10자리 코드를 검증한다', () => {
      expect(isValidCode('1100000000')).toBe(true);
      expect(isValidCode('4372025021')).toBe(true);
    });

    it('유효하지 않은 코드를 거부한다', () => {
      expect(isValidCode('110000000')).toBe(false); // 9자리
      expect(isValidCode('11000000001')).toBe(false); // 11자리
      expect(isValidCode('110000000a')).toBe(false); // 문자 포함
      expect(isValidCode('')).toBe(false);
    });
  });

  describe('getParentCode', () => {
    it('시도는 부모가 없다', () => {
      expect(getParentCode('1100000000', 'sido')).toBeNull();
    });

    it('시군구의 부모는 시도이다', () => {
      expect(getParentCode('1111000000', 'sigungu')).toBe('1100000000');
    });

    it('읍면동의 부모는 시군구이다', () => {
      expect(getParentCode('1111010100', 'eupmyeondong')).toBe('1111000000');
    });

    it('리의 부모는 읍면동이다', () => {
      expect(getParentCode('4372025021', 'ri')).toBe('4372025000');
    });
  });
});
