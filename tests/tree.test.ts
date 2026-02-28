import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'node:path';
import { parseCSV } from '../src/core/parser.js';
import { buildTree, buildSubTree, flattenTree } from '../src/core/tree.js';
import type { BjdRecord } from '../src/types/index.js';

const FIXTURE_PATH = resolve(import.meta.dirname, 'fixtures/sample.csv');

let activeRecords: BjdRecord[];

beforeAll(async () => {
  const all = await parseCSV({
    filePath: FIXTURE_PATH,
    encoding: 'utf-8',
    useWorker: false,
  });
  activeRecords = all.filter((r) => r.isActive);
});

describe('buildTree', () => {
  it('시도를 루트로 트리를 구성한다', () => {
    const tree = buildTree(activeRecords);
    // 루트는 시도 레벨
    expect(tree.length).toBe(4); // 서울, 부산, 경기, 충북
    expect(tree[0].level).toBe('sido');
    expect(tree[0].name).toBe('서울특별시');
  });

  it('시도 아래에 시군구가 있다', () => {
    const tree = buildTree(activeRecords);
    const seoul = tree.find((n) => n.name === '서울특별시')!;
    expect(seoul.children.length).toBe(2); // 종로구, 중구
    expect(seoul.children[0].level).toBe('sigungu');
  });

  it('시군구 아래에 읍면동이 있다', () => {
    const tree = buildTree(activeRecords);
    const seoul = tree.find((n) => n.name === '서울특별시')!;
    const jongno = seoul.children.find((n) => n.name === '종로구')!;
    expect(jongno.children.length).toBeGreaterThan(0);
    expect(jongno.children[0].level).toBe('eupmyeondong');
  });

  it('읍면동 아래에 리가 있다', () => {
    const tree = buildTree(activeRecords);
    const chungbuk = tree.find((n) => n.name === '충청북도')!;
    const jeungpyeong = chungbuk.children.find((n) => n.name === '증평군')!;
    const jeungpyeongEup = jeungpyeong.children.find((n) => n.name === '증평읍')!;
    expect(jeungpyeongEup.children.length).toBe(3); // 송산리, 율리, 남하리
    expect(jeungpyeongEup.children[0].level).toBe('ri');
  });
});

describe('buildSubTree', () => {
  it('특정 프리픽스 기준 서브트리를 구성한다', () => {
    const subTree = buildSubTree(activeRecords, '11');
    expect(subTree.length).toBe(1); // 서울특별시
    expect(subTree[0].name).toBe('서울특별시');
  });

  it('읍면동 프리픽스로 서브트리를 구성한다', () => {
    const subTree = buildSubTree(activeRecords, '43720250');
    // 증평읍 + 하위 리 3개
    expect(subTree.length).toBe(1);
    expect(subTree[0].name).toBe('증평읍');
    expect(subTree[0].children.length).toBe(3);
  });
});

describe('flattenTree', () => {
  it('트리를 평탄화한다', () => {
    const tree = buildTree(activeRecords);
    const flat = flattenTree(tree);
    expect(flat.length).toBe(activeRecords.length);
  });

  it('깊이 우선 순서로 평탄화한다', () => {
    const tree = buildTree(activeRecords);
    const flat = flattenTree(tree);
    // 첫 번째는 서울특별시 (루트)
    expect(flat[0].name).toBe('서울특별시');
    // 서울 다음은 종로구 (자식)
    expect(flat[1].name).toBe('종로구');
  });
});
