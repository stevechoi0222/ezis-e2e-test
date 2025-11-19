# Admin UI 테스트 (Playwright)

http://192.168.5.2:8080 내부 데이터베이스 모니터링 대시보드를 자동으로 테스트하는 Playwright 프로젝트입니다.

## 빠른 시작 (원클릭 실행)

**`run-test.bat` 파일을 더블클릭하면 모든 것이 자동으로 실행됩니다!**

스크립트가 자동으로:
1. 필요한 패키지를 설치합니다 (처음 실행시만)
2. Chrome 브라우저를 전체화면으로 엽니다
3. 자동 테스트를 시작합니다

## 1. 의존성 설치 (수동)

먼저 프로젝트 폴더로 이동합니다:

```bash
cd admin-test-suite
```

그 다음 필요한 패키지를 설치합니다:

```bash
npm install
npx playwright install
```

## 2. 테스트 실행

### 화면 표시 모드 (데모용 추천)
```bash
npm run test:headed
```

이 명령어를 실행하면:
- Chrome 브라우저가 전체화면으로 열립니다
- 자동으로 로그인합니다 (ID: admin, 비밀번호: dlwltm)
- 마우스 포인터가 보이며 각 메뉴를 순서대로 클릭합니다
- 각 클릭 사이에 5초 대기합니다
- 총 35개 메뉴를 자동으로 탐색합니다

### UI 모드 (Playwright 테스트 러너 GUI)
```bash
npm run test:ui
```

### 일반 CLI 실행
```bash
npm test
```

## 3. 테스트 설정

### 대기 시간 변경
`tests/admin-login-and-dashboard.spec.ts` 파일의 94번 줄에서 클릭 간 대기 시간을 조정할 수 있습니다:

```typescript
await page.waitForTimeout(5000);  // 5000 = 5초
```

- 3초로 변경: `3000`
- 10초로 변경: `10000`

### 화면 해상도 변경
`playwright.config.ts` 파일에서 해상도를 변경할 수 있습니다:

```typescript
viewport: { width: 1920, height: 1080 }  // Full HD
```

다른 해상도 예시:
- 2K: `{ width: 2560, height: 1440 }`
- 4K: `{ width: 3840, height: 2160 }`

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
4. Inspector에서 생성된 코드를 복사하여 `tests/admin-login-and-dashboard.spec.ts` 파일의 해당 부분을 수정합니다
