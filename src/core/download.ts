import { createWriteStream, mkdirSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { dirname } from 'node:path';
import { DATA_DIR, DEFAULT_CSV_PATH } from '../utils/paths.js';

const DOWNLOAD_URL =
  'https://www.data.go.kr/cmm/cmm/fileDownload.do?atchFileId=FILE_000000002647058&fileDetailSn=1';

export interface DownloadOptions {
  /** 다운로드 URL (기본: data.go.kr) */
  url?: string;
  /** 저장 경로 (기본: ~/.bjd-code/data.csv) */
  outputPath?: string;
}

/** 법정동 코드 CSV 다운로드 */
export async function downloadCSV(options?: DownloadOptions): Promise<string> {
  const url = options?.url ?? DOWNLOAD_URL;
  const outputPath = options?.outputPath ?? DEFAULT_CSV_PATH;

  mkdirSync(dirname(outputPath), { recursive: true });

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'bjd-code/0.1.0',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`다운로드 실패 (HTTP ${response.status}). 수동으로 다운로드하세요:\n${MANUAL_INSTRUCTIONS}`);
  }

  if (!response.body) {
    throw new Error('응답 본문이 비어있습니다.');
  }

  const body = Readable.fromWeb(response.body as import('node:stream/web').ReadableStream);
  await pipeline(body, createWriteStream(outputPath));

  return outputPath;
}

const MANUAL_INSTRUCTIONS = `
1. https://www.data.go.kr/tcs/dss/selectFileDataDetailView.do?publicDataPk=15063424 접속
2. CSV 파일 다운로드
3. 다운로드한 파일을 다음 경로에 저장: ${DEFAULT_CSV_PATH}
   또는 CLI 사용 시 파일 경로를 직접 지정: bjd parse ./파일경로.csv`.trim();

export { MANUAL_INSTRUCTIONS, DATA_DIR };
