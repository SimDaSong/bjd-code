import type { BjdRecord, BjdTreeNode } from '../types/index.js';

/**
 * BjdRecord[] → 트리 구조 빌드 (O(n) 단일 패스)
 * 시도 → 시군구 → 읍면동 → 리 계층
 */
export function buildTree(records: BjdRecord[]): BjdTreeNode[] {
  const roots: BjdTreeNode[] = [];
  const nodeMap = new Map<string, BjdTreeNode>();

  // 이미 정렬되어 있으면 복사/정렬 skip
  const sorted = isSorted(records)
    ? records
    : [...records].sort((a, b) => a.code.localeCompare(b.code));

  for (const record of sorted) {
    const node: BjdTreeNode = {
      code: getCodeSegment(record),
      fullCode: record.code,
      name: record.names[record.names.length - 1],
      level: record.level,
      children: [],
    };

    nodeMap.set(record.code, node);

    const parentKey = getParentKey(record);
    if (parentKey) {
      const parent = nodeMap.get(parentKey);
      if (parent) {
        parent.children.push(node);
      } else {
        // 부모가 없으면 루트에 추가
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * 특정 코드 프리픽스 기준 서브트리 빌드
 */
export function buildSubTree(records: BjdRecord[], prefix: string): BjdTreeNode[] {
  const filtered = records.filter((r) => r.code.startsWith(prefix));
  return buildTree(filtered);
}

/**
 * 트리 → 배열 평탄화 (깊이 우선)
 */
export function flattenTree(nodes: BjdTreeNode[]): BjdTreeNode[] {
  const result: BjdTreeNode[] = [];

  function walk(nodeList: BjdTreeNode[]) {
    for (const node of nodeList) {
      result.push(node);
      if (node.children.length > 0) {
        walk(node.children);
      }
    }
  }

  walk(nodes);
  return result;
}

/** 해당 레벨의 코드 조각 추출 */
function getCodeSegment(record: BjdRecord): string {
  switch (record.level) {
    case 'sido':
      return record.sidoCode;
    case 'sigungu':
      return record.sigunguCode;
    case 'eupmyeondong':
      return record.eupmyeondongCode;
    case 'ri':
      return record.riCode;
  }
}

/** 배열이 코드 기준 정렬 상태인지 확인 */
function isSorted(records: BjdRecord[]): boolean {
  for (let i = 1; i < records.length; i++) {
    if (records[i].code < records[i - 1].code) return false;
  }
  return true;
}

/** 부모 노드의 전체 코드 계산 */
function getParentKey(record: BjdRecord): string | null {
  switch (record.level) {
    case 'sido':
      return null;
    case 'sigungu':
      return record.sidoCode + '00000000';
    case 'eupmyeondong':
      return record.sidoCode + record.sigunguCode + '00000';
    case 'ri':
      return record.sidoCode + record.sigunguCode + record.eupmyeondongCode + '00';
  }
}
