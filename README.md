# bjd-code (법정동 코드)

[국토교통부_전국 법정동 CSV](https://www.data.go.kr/tcs/dss/selectFileDataDetailView.do?publicDataPk=15063424) 데이터를 파싱, 필터링, 트리 구조화하는 Node.js/TypeScript 라이브러리.

## 기능

- CSV 파싱 (EUC-KR/UTF-8 자동 처리, worker_threads 지원)
- 시도/시군구/읍면동/리 레벨별 필터링
- 이름 검색
- 트리 구조 변환 (시도 → 시군구 → 읍면동 → 리)
- CLI 도구 (다운로드, 파싱, 필터링, 트리, 검색)

## 설치

```bash
npm install bjd-code
```

## 빠른 시작

```bash
# 1. 데이터 다운로드 (~/.bjd-code/data.csv에 저장)
bjd download

# 2. 바로 사용 (파일 경로 생략 가능)
bjd parse --pretty
bjd filter --level sido --pretty
bjd tree --pretty
bjd search 강남구
```

## 사용법

### 라이브러리

```typescript
import { parseCSV, filterSido, buildTree, loadTree, searchByName, downloadCSV } from 'bjd-code';

// 데이터 다운로드 (최초 1회)
await downloadCSV();

// CSV 파싱 (경로 생략 시 ~/.bjd-code/data.csv 사용)
const records = await parseCSV();

// 직접 파일 경로 지정도 가능
const records2 = await parseCSV({ filePath: './my-data.csv' });

// 시도만 추출
const sidos = filterSido(records);

// 트리 구조 빌드
const tree = buildTree(records.filter(r => r.isActive));

// 편의 함수 (파싱 + 트리 한번에)
const tree2 = await loadTree();

// 이름 검색
const results = searchByName(records, '종로구');
```

### CLI

```bash
# 데이터 다운로드
bjd download                       # ~/.bjd-code/data.csv에 저장
bjd download -o ./data/bjd.csv     # 경로 지정
bjd download --url <url>           # URL 직접 지정

# 전체 데이터 파싱
bjd parse                          # 다운로드된 데이터 사용
bjd parse ./my-data.csv            # 파일 경로 직접 지정

# 레벨별 필터링
bjd filter --level sido --pretty
bjd filter ./data.csv --level sigungu

# 트리 구조
bjd tree --pretty -o tree.json

# 이름 검색
bjd search 강남구

# 공통 옵션
#   --include-inactive   폐지된 코드 포함
#   --pretty             JSON 포맷팅
#   -o, --output <file>  파일로 저장
#   --encoding <enc>     CSV 인코딩 (기본: euc-kr)
```

## 코드 구조

법정동 코드는 10자리 숫자로 구성:

| 위치 | 자릿수 | 레벨 | 예시 |
|------|--------|------|------|
| 1-2 | 시도 | `sido` | 11 (서울) |
| 3-5 | 시군구 | `sigungu` | 110 (종로구) |
| 6-8 | 읍면동 | `eupmyeondong` | 101 (청운동) |
| 9-10 | 리 | `ri` | 21 (송산리) |

뒷자리가 0으로 채워진 패턴으로 레벨을 판단합니다:
- `1100000000` → 시도 (서울특별시)
- `1111000000` → 시군구 (종로구)
- `1111010100` → 읍면동 (청운동)
- `4372025021` → 리 (송산리)

## 개발

```bash
npm install
npm run build
npm test
```

## 기술 스택

- Node.js 18+, ESM
- TypeScript, Vitest
- csv-parse, iconv-lite, commander
