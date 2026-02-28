// Types
export type {
  RawBjdRow,
  BjdRecord,
  BjdLevel,
  BjdTreeNode,
  FilterOptions,
  ParseOptions,
} from './types/index.js';

// Code utilities
export {
  extractSidoCode,
  extractSigunguCode,
  extractEupmyeondongCode,
  extractRiCode,
  determineLevel,
  isValidCode,
  getParentCode,
} from './utils/code.js';

// Parser
export { parseCSV, normalizeRow } from './core/parser.js';

// Filters
export {
  filterSido,
  filterSigungu,
  filterEupmyeondong,
  filterRi,
  filterByLevel,
  searchByName,
} from './core/filter.js';

// Tree
export { buildTree, buildSubTree, flattenTree } from './core/tree.js';

// Download
export { downloadCSV } from './core/download.js';
export type { DownloadOptions } from './core/download.js';

// Paths
export { DEFAULT_CSV_PATH, hasDefaultData, resolveDataPath } from './utils/paths.js';

// Convenience functions
import type { BjdRecord, BjdTreeNode, BjdLevel, ParseOptions, FilterOptions } from './types/index.js';
import { parseCSV } from './core/parser.js';
import { filterByLevel, searchByName } from './core/filter.js';
import { buildTree } from './core/tree.js';

/** parse + buildTree 편의 함수 */
export async function loadTree(options?: ParseOptions): Promise<BjdTreeNode[]> {
  const records = await parseCSV(options);
  const active = records.filter((r) => r.isActive);
  return buildTree(active);
}

/** parse + filter 편의 함수 */
export async function loadFiltered(
  options?: ParseOptions & { level?: BjdLevel; query?: string } & FilterOptions,
): Promise<BjdRecord[]> {
  const records = await parseCSV(options);
  const filterOpts: FilterOptions = { includeInactive: options?.includeInactive };

  if (options?.query) {
    return searchByName(records, options.query, filterOpts);
  }
  if (options?.level) {
    return filterByLevel(records, options.level, filterOpts);
  }
  if (!options?.includeInactive) {
    return records.filter((r) => r.isActive);
  }
  return records;
}
