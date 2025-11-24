# Admin UI 자동 테스트 (Playwright)

http://192.168.5.2:8080 내부 데이터베이스 모니터링 대시보드를 자동으로 테스트하는 Playwright 프로젝트입니다.

## 빠른 시작 (원클릭 실행)

**`run-test.bat` 파일을 더블클릭하면 모든 것이 자동으로 실행됩니다!**

스크립트가 자동으로:
1. 필요한 패키지를 설치합니다 (처음 실행시만)
2. Chrome 브라우저를 전체화면으로 엽니다
3. 자동 테스트를 시작합니다

## 프로젝트 구조

```
admin-test-suite/
├── src/
│   └── notifications.ts        # 화면 알림 시스템
├── tests/
│   └── admin-login-and-dashboard.spec.ts  # 메인 테스트
├── package.json                # NPM 설정
├── playwright.config.ts        # Playwright 설정
├── tsconfig.json              # TypeScript 설정
├── run-test.bat               # 원클릭 실행 스크립트
└── README.md                  # 이 파일
```

## 수동 설치 및 실행

### 1. 의존성 설치

프로젝트 폴더로 이동합니다:

```bash
cd admin-test-suite
```

필요한 패키지를 설치합니다:

```bash
npm install
npx playwright install chromium
```

### 2. 테스트 실행

#### 기본 실행 (브라우저 표시)
```bash
npm run test:headed
```

#### UI 모드 (Playwright 테스트 러너 GUI)
```bash
npm run test:ui
```

#### Headless 모드 (백그라운드 실행)
```bash
npm test
```

## 테스트 내용

테스트는 다음을 수행합니다:

1. **로그인**
   - ID: admin, 비밀번호: dlwltm로 자동 로그인
   - 로그인 완료 후 20초간 대시보드 표시

2. **메뉴 탐색** (총 35개 항목, 3회 반복)
   - Session → Lock → Transaction
   - RAC → Performance → UltraSessionSnapshot
   - Top SQL → Top Event → Top Session
   - Wait Analysis → SQL Analysis
   - Change Tracking → Capacity Management
   - Event Analysis → Trace File → AWR Report
   - 각 메뉴 클릭 간 5초 대기

3. **시각적 효과**
   - 마우스 포인터 표시 (SVG 커서)
   - 화면 알림 메시지
     - "로그인 중..." (진행)
     - "대시보드 로딩 완료" (성공)
     - "자동 테스트 진행 중..." (진행)
     - "✓ 테스트 완료! 모든 기능이 정상 작동합니다." (완료)

## 설정 변경

### 클릭 간 대기 시간 조정

`tests/admin-login-and-dashboard.spec.ts` 파일의 114번 줄:

```typescript
await page.waitForTimeout(4000);  // 5000 = 5초
```

- 3초로 변경: `3000`
- 10초로 변경: `10000`

### 화면 해상도 변경

`playwright.config.ts` 파일:

```typescript
viewport: { width: 1920, height: 1080 }  // Full HD
```

다른 해상도 예시:
- 2K: `{ width: 2560, height: 1440 }`
- 4K: `{ width: 3840, height: 2160 }`

### 반복 횟수 변경

`tests/admin-login-and-dashboard.spec.ts` 파일의 154번 줄:

```typescript
for (let i = 0; i < 3; i++) {  // 3회 반복
```

### 알림 메시지 커스터마이즈

`src/notifications.ts` 파일에서 알림 스타일과 메시지를 수정할 수 있습니다.

## 문제 해결

### 로그인 선택자 조정 (필요시)

로그인이 실패하는 경우 Playwright Inspector를 사용하여 정확한 선택자를 찾을 수 있습니다:

```bash
npx playwright codegen http://192.168.5.2:8080
```

브라우저와 Inspector 창이 열리면:
1. 사용자 이름 필드를 클릭
2. 비밀번호 필드를 클릭
3. 로그인 버튼을 클릭
4. Inspector에서 생성된 코드를 복사하여 `tests/admin-login-and-dashboard.spec.ts` 파일 수정

### 테스트 타임아웃

테스트가 오래 걸리는 경우 `playwright.config.ts`에서 타임아웃 조정:

```typescript
timeout: 600000,  // 10분 (600,000ms)
```

## 기술 스택

- **Playwright**: 브라우저 자동화
- **TypeScript**: 타입 안전 코드
- **Node.js**: 런타임 환경
