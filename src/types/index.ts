/** CSV 원본 행 (한글 컬럼명) */
export interface RawBjdRow {
  법정동코드: string;
  법정동명: string;
  폐지여부: string;
}

/** 법정동 레벨 */
export type BjdLevel = 'sido' | 'sigungu' | 'eupmyeondong' | 'ri';

/** 정규화된 법정동 레코드 */
export interface BjdRecord {
  /** 전체 10자리 코드 */
  code: string;
  /** 시도 코드 (1-2자리) */
  sidoCode: string;
  /** 시군구 코드 (3-5자리) */
  sigunguCode: string;
  /** 읍면동 코드 (6-8자리) */
  eupmyeondongCode: string;
  /** 리 코드 (9-10자리) */
  riCode: string;
  /** 법정동명 (전체) */
  name: string;
  /** 공백 분리된 이름 배열 */
  names: string[];
  /** 행정 레벨 */
  level: BjdLevel;
  /** 현행 사용 여부 */
  isActive: boolean;
}

/** 트리 노드 */
export interface BjdTreeNode {
  /** 해당 레벨의 코드 조각 */
  code: string;
  /** 전체 10자리 코드 */
  fullCode: string;
  /** 이름 */
  name: string;
  /** 행정 레벨 */
  level: BjdLevel;
  /** 하위 노드 */
  children: BjdTreeNode[];
}

/** 필터 옵션 */
export interface FilterOptions {
  /** 폐지된 코드 포함 여부 (기본 false) */
  includeInactive?: boolean;
}

/** 파싱 옵션 */
export interface ParseOptions {
  /** CSV 파일 경로 (미지정 시 ~/.bjd-code/data.csv 사용) */
  filePath?: string;
  /** 인코딩 (기본 'euc-kr') */
  encoding?: string;
  /** worker_threads 사용 여부 (기본 true) */
  useWorker?: boolean;
}

/** Worker → 메인 메시지 */
export type WorkerMessage =
  | { type: 'result'; data: BjdRecord[] }
  | { type: 'error'; message: string };

/** 메인 → Worker 데이터 */
export interface WorkerData {
  filePath: string;
  encoding: string;
}
