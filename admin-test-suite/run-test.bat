@echo off
chcp 65001 >nul
echo ========================================
echo Admin UI 자동 테스트 시작
echo ========================================
echo.

echo [1/2] 의존성 확인 중...
if not exist "node_modules" (
    echo 의존성을 설치합니다...
    call npm install
    call npx playwright install chromium
    echo.
) else (
    echo 의존성이 이미 설치되어 있습니다.
    echo.
)

echo [2/2] 테스트 실행 중...
echo 브라우저가 곧 열립니다...
echo.
call npm run test:headed

echo.
echo ========================================
echo 테스트 완료!
echo ========================================
pause
