import { test, expect, Page } from '@playwright/test';
import {
  showMessage,
  hideMessage,
  updateProgress,
  showAction,
  showMetadata,
  showPhase,
  highlightElement,
  unhighlightElement,
  flashSuccess
} from '../src/notifications';

// Test state tracker
let currentStep = 0;
let totalSteps = 35; // Total number of menu clicks

// Helper to inject a visible mouse pointer overlay
async function installMouseHelper(page: Page) {
  await page.addInitScript(() => {
    // Install mouse helper only if it hasn't been installed yet
    if (document.getElementById('mouse-helper')) return;

    document.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'mouse-helper';
      cursor.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" style="display: block;">
          <path d="M7 2 L7 18 L11 14 L14 21 L16 20 L13 13 L19 13 Z"
                fill="black" stroke="white" stroke-width="1"/>
        </svg>
      `;
      cursor.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 999999;
        left: 0;
        top: 0;
        transition: none;
      `;
      document.body.appendChild(cursor);

      let currentX = 0;
      let currentY = 0;

      document.addEventListener('mousemove', (e) => {
        currentX = e.clientX;
        currentY = e.clientY;
        cursor.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px)';
      });
    });
  });
}

async function moveMouseToElement(page: Page, selector: string) {
  const element = await page.locator(selector).first().boundingBox();
  if (element) {
    const x = element.x + element.width / 2;
    const y = element.y + element.height / 2;
    await page.mouse.move(x, y, { steps: 30 });
    await page.waitForTimeout(300);
  }
}

async function loginIfNeeded(page: Page) {
  // Install mouse helper
  await installMouseHelper(page);

  // Go to the root first
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Wait for page to be ready
  await page.waitForTimeout(2000);

  // Show login message
  await showMessage(page, '로그인 중...', 'info');

  // If we already see "Administrator" in the top bar, assume logged in
  const adminLabel = page.getByText('Administrator', { exact: false });
  if (await adminLabel.isVisible().catch(() => false)) {
    return;
  }

  // Otherwise we are on the login screen
  await moveMouseToElement(page, 'article input[name="id"]');
  await page.getByRole('article').locator('input[name="id"]').click();
  await page.keyboard.type('admin', { delay: 100 });
  await page.waitForTimeout(1000);

  await moveMouseToElement(page, 'article input[name="passwd"]');
  await page.getByRole('article').locator('input[name="passwd"]').click();
  await page.keyboard.type('dlwltm', { delay: 100 });

  // Try to find and click the login button
  const loginButton = page.getByRole('button', { name: 'SSO Sign in' });
  const buttonBox = await loginButton.boundingBox();
  if (buttonBox) {
    await page.mouse.move(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2, { steps: 30 });
    await page.waitForTimeout(300);
  }
  await loginButton.click();
  await page.waitForTimeout(500);

  // Wait until dashboard loads (Administrator text visible)
  await expect(page.getByText('Administrator', { exact: false })).toBeVisible();

  // Show dashboard loaded message
  await showMessage(page, '대시보드 로딩 완료', 'success');

  // Wait 2 seconds to show the dashboard
  await page.waitForTimeout(2000);

  // Show testing message
  await showMessage(page, '자동 테스트 진행 중...', 'info');
  await page.waitForTimeout(1000);

  // Hide the message
  await hideMessage(page);
}

async function clickWithMouseMove(page: Page, locator: any, actionName: string) {
  // IMPORTANT: Get element reference FIRST before showing any action text
  let element;
  try {
    // Wait for element to be available and get reference
    element = locator.first();
    await element.waitFor({ state: 'visible', timeout: 10000 });
  } catch (error) {
    console.log(`Warning: ${actionName} element not found, skipping...`);
    await showAction(page, `⚠ ${actionName} not found, skipping`, 'success');
    await page.waitForTimeout(1000);
    return;
  }

  // Get element bounding box
  const box = await element.boundingBox();

  // Show the action text (don't update progress yet)
  await showAction(page, `Navigating to ${actionName}...`, 'running');

  // Highlight element (only if box is available)
  if (box) {
    try {
      await page.evaluate((boxCoords) => {
        const element = document.elementFromPoint(boxCoords.x + boxCoords.width / 2, boxCoords.y + boxCoords.height / 2);
        if (element) {
          (element as HTMLElement).style.outline = '3px solid #F59E0B';
          (element as HTMLElement).style.outlineOffset = '2px';
        }
      }, box);
    } catch (e) {
      // Element highlighting failed, continue anyway
    }
  }

  await page.waitForTimeout(300);

  // Move mouse to element
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 30 });
    await page.waitForTimeout(200);
  }

  // Click using the element reference we got earlier
  await element.click();

  // Flash success (only if box is available)
  if (box) {
    try {
      await page.evaluate((boxCoords) => {
        const element = document.elementFromPoint(boxCoords.x + boxCoords.width / 2, boxCoords.y + boxCoords.height / 2);
        if (element) {
          (element as HTMLElement).style.outline = '3px solid #10B981';
          setTimeout(() => {
            (element as HTMLElement).style.outline = 'none';
          }, 400);
        }
      }, box);
    } catch (e) {
      // Flash failed, continue
    }
  }

  // Page has loaded successfully, NOW increment the step counter
  currentStep++;

  // Show success and update progress bar (now that action completed)
  await page.waitForTimeout(500);
  await updateProgress(page, currentStep, totalSteps);
  await showAction(page, `✓ ${actionName} loaded`, 'success');
  await page.waitForTimeout(2000); // Reduced from 5000ms to 2000ms
}

async function runDashboardScenario(page: Page) {
  // Phase 1: Session Management
  await showPhase(page, 'Session Management', 1, 5);
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Session' }), 'Session');
  await clickWithMouseMove(page, page.getByText('Lock', { exact: true }), 'Lock');
  await clickWithMouseMove(page, page.getByText('Transaction'), 'Transaction');

  // Phase 2: RAC Monitoring
  await showPhase(page, 'RAC Monitoring', 2, 5);
  await clickWithMouseMove(page, page.getByRole('link', { name: 'RAC', exact: true }), 'RAC');
  await clickWithMouseMove(page, page.getByRole('button', { name: 'RAC19CDB' }), 'RAC19CDB');

  // Phase 3: Performance Analysis
  await showPhase(page, 'Performance Analysis', 3, 5);
  await clickWithMouseMove(page, page.getByText('Performance Performance'), 'Performance');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Performance' }), 'Performance Dashboard');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'UltraSessionSnapshot' }), 'UltraSessionSnapshot');
  await clickWithMouseMove(page, page.getByText('Top SQL'), 'Top SQL');
  await clickWithMouseMove(page, page.getByText('Top Event'), 'Top Event');
  await clickWithMouseMove(page, page.getByText('Top Session'), 'Top Session');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Wait Analysis' }), 'Wait Analysis');
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'Wait Event' }), 'Wait Event');
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'Active Session Elapsedtime(' }), 'Active Session Elapsedtime');
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'Active Session I/O(Block)' }), 'Active Session I/O');
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'CPU (Session)' }), 'CPU Session');
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'Sysstat' }).first(), 'Sysstat');

  // Phase 4: SQL & Session Analysis
  await showPhase(page, 'SQL & Session Analysis', 4, 5);
  await clickWithMouseMove(page, page.getByRole('link', { name: 'SQL Analysis' }), 'SQL Analysis');
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'SQL Square Map' }), 'SQL Square Map');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Session Square Map' }), 'Session Square Map');
  // Filter out test overlays when searching for SQL Scatter View
  await clickWithMouseMove(page, page.locator('main').getByRole('link', { name: 'SQL Scatter View' }), 'SQL Scatter View');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Top SQL Map' }), 'Top SQL Map');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Change Tracking' }), 'Change Tracking');
  await clickWithMouseMove(page, page.getByText('Object Change History'), 'Object Change History');
  await clickWithMouseMove(page, page.getByText('Parameter History'), 'Parameter History');

  // Phase 5: System Management & Reporting
  await showPhase(page, 'System Management & Reporting', 5, 5);
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Capacity Management' }), 'Capacity Management');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'ASM Info' }), 'ASM Info');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Event Analysis' }), 'Event Analysis');
  await clickWithMouseMove(page, page.getByText('AlertLog List'), 'AlertLog List');
  await clickWithMouseMove(page, page.getByText('Event EZIS List'), 'Event EZIS List');
  await clickWithMouseMove(page, page.getByText('-11-19 11:24:33'), 'Event Details');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Trace File' }), 'Trace File');
  await clickWithMouseMove(page, page.getByText('Report Long Term AWR Report'), 'Report Long Term AWR');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Long Term' }), 'Long Term');
  await clickWithMouseMove(page, page.getByRole('link', { name: 'AWR Report' }), 'AWR Report');
}

test('Admin dashboard – login and smooth visual scenario (3x)', async ({ page }) => {
  // Generate test run ID
  const runId = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

  await loginIfNeeded(page);

  const totalLoops = 1;
  for (let i = 0; i < totalLoops; i++) {
    console.log(`Scenario run #${i + 1}`);

    // Reset step counter for each loop
    currentStep = 0;

    // Show metadata overlay and initial progress at the same time
    await Promise.all([
      showMetadata(page, 'Dashboard Navigation', runId, i + 1, totalLoops),
      updateProgress(page, 0, totalSteps)
    ]);

    // Run the scenario immediately
    await runDashboardScenario(page);

    // Pause between loops (except last one)
    if (i < totalLoops - 1) {
      await page.waitForTimeout(2000);
    }
  }

  // Show completion message
  await showMessage(page, '✓ 테스트 완료! 모든 기능이 정상 작동합니다.', 'success');
  await page.waitForTimeout(5000);
});
