import { test } from '@playwright/test';
import {
  loginIfNeeded,
  clickWithMouseMove,
  doubleClickWithMouseMove,
  scrollWithinElement,
  dragWithMouseMove,
  closePopupByX,
  setTotalSteps,
  resetStepCounter,
  showMessage,
  showMetadata,
  showPhase,
  showAction,
  updateProgress
} from '../src/test-helpers';

const totalSteps = 30; // Total number of actions

test('Session Activity – graphs, popups, and tables scenario (Parts 1-2/3)', async ({ page }) => {
  // Generate test run ID
  const runId = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

  // Set up test state
  setTotalSteps(totalSteps);

  await loginIfNeeded(page);

  // Reset step counter
  resetStepCounter();

  // Show metadata overlay and initial progress
  await Promise.all([
    showMetadata(page, 'Session Activity Scenario', runId, 1, 1),
    updateProgress(page, 0, totalSteps)
  ]);

  // ============================================
  // Phase 1: Navigate to Session Page
  // ============================================
  await showPhase(page, 'Navigate to Session', 1, 7);

  // Step 1: Click Session in sidebar
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Session' }), 'Session');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // ============================================
  // Phase 2: Session Info Popup
  // ============================================
  await showPhase(page, 'Session Info Popup', 2, 7);

  // Step 2: Double-click middle of "Active Sessions Count" graph (first left graph)
  const activeSessionsGraph = page.locator('#linechart0 rect');
  await doubleClickWithMouseMove(page, activeSessionsGraph, 'Active Sessions Count Graph');

  // Wait for Session Info popup to appear
  await page.waitForTimeout(1000);

  // Step 3: Click "Elapsed Time(sec)" column header
  await clickWithMouseMove(
    page,
    page.getByText('Elapsed Time(sec)'),
    'Elapsed Time(sec) Header'
  );

  // Step 4: Click "L/Reads" column header (inside Session Info popup)
  await clickWithMouseMove(
    page,
    page.getByLabel('Session Info').getByText('L/Reads'),
    'L/Reads Header'
  );

  // Step 5: Click "P/Reads" column header (inside Session Info popup)
  await clickWithMouseMove(
    page,
    page.getByLabel('Session Info').getByText('P/Reads'),
    'P/Reads Header'
  );

  // Step 6: Close Session Info popup (use role dialog selector)
  await clickWithMouseMove(
    page,
    page.getByRole('dialog', { name: 'Session Info' }).getByRole('button', { name: 'close' }),
    'Close Session Info'
  );

  // ============================================
  // Phase 3: Dropdown Menu Interactions
  // ============================================
  await showPhase(page, 'Dropdown Menu Interactions', 3, 7);

  // Step 7: Click "Active Sessions Count" header to open dropdown
  const graphHeader = page.locator('text=Active Sessions Count').first();
  await clickWithMouseMove(page, graphHeader, 'Active Sessions Count Dropdown');

  // Wait for dropdown to appear
  await page.waitForTimeout(500);

  // Get header position to know where dropdown appears (right below it)
  const headerBox = await graphHeader.boundingBox();
  if (headerBox) {
    // Move mouse below the header into the dropdown area
    const dropdownX = headerBox.x + headerBox.width / 2;
    const dropdownY = headerBox.y + headerBox.height + 100; // 100px below header
    await page.mouse.move(dropdownX, dropdownY, { steps: 20 });
    await page.waitForTimeout(300);

    // Step 8: Scroll dropdown all the way down (3 seconds)
    await showAction(page, 'Scrolling dropdown down...', 'running');
    for (let i = 0; i < 30; i++) { // 30 iterations * 50ms = 1.5 seconds
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }
    await showAction(page, '✓ Scrolled down', 'success');

    // Step 9: Scroll dropdown all the way up (1.5 seconds)
    await showAction(page, 'Scrolling dropdown up...', 'running');
    for (let i = 0; i < 30; i++) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(50);
    }
    await showAction(page, '✓ Scrolled up', 'success');
  }

  // Step 10: Click "CPU used by this session(cs)"
  await clickWithMouseMove(
    page,
    page.getByText('CPU used by this session(cs)', { exact: false }),
    'CPU used by this session(cs)'
  );

  // Step 11: Click header again to reopen dropdown
  await page.waitForTimeout(1000);
  await clickWithMouseMove(page, page.locator('text=CPU used by this session').first(), 'Graph Header');
  await page.waitForTimeout(500);

  // Step 12: Click "DB time"
  await clickWithMouseMove(
    page,
    page.getByText('DB time', { exact: false }),
    'DB time'
  );

  // Step 13: Click header again to reopen dropdown
  await page.waitForTimeout(1000);
  await clickWithMouseMove(page, page.locator('text=DB time').first(), 'Graph Header');
  await page.waitForTimeout(500);

  // Step 14: Click "Active Sessions Count" to go back
  await clickWithMouseMove(
    page,
    page.getByText('Active Sessions Count', { exact: false }).first(),
    'Active Sessions Count'
  );

  // ============================================
  // Phase 4: Drag Selection on Graph
  // ============================================
  await showPhase(page, 'Drag Selection on Graph', 4, 7);

  // Step 15: Drag on "Active Session Elapsed Time" graph
  // Graph is in the right bottom area, above the table
  const elapsedTimeGraph = page.locator('#spot_view > div > svg > rect');
  const graphBox = await elapsedTimeGraph.boundingBox();

  if (graphBox) {
    // Drag from left-middle to middle-bottom
    const startX = graphBox.x + graphBox.width * 0.1;
    const startY = graphBox.y + graphBox.height * 0.5;
    const endX = graphBox.x + graphBox.width * 0.5;
    const endY = graphBox.y + graphBox.height * 0.9;

    await showAction(page, 'Dragging on Active Session Elapsed Time graph...', 'running');

    await page.mouse.move(startX, startY, { steps: 30 });
    await page.waitForTimeout(300);
    await page.mouse.down();
    await page.waitForTimeout(200);
    await page.mouse.move(endX, endY, { steps: 50 });
    await page.waitForTimeout(300);
    await page.mouse.up();

    await showAction(page, '✓ Drag completed', 'success');
  }

  // Wait for Active Sessions popup to appear
  await page.waitForTimeout(1000);

  // Step 16: Scroll all the way down in the popup (use role dialog)
  const activeSessionsPopup = page.getByRole('dialog').last();
  const popupBox = await activeSessionsPopup.boundingBox();
  if (popupBox) {
    await page.mouse.move(popupBox.x + popupBox.width / 2, popupBox.y + popupBox.height / 2, { steps: 20 });
    await showAction(page, 'Scrolling popup down...', 'running');
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }
    await showAction(page, '✓ Scrolled down', 'success');
  }

  // Step 17: Close the popup via X button
  await clickWithMouseMove(
    page,
    page.getByRole('dialog').last().getByRole('button', { name: 'close' }),
    'Close Active Sessions Popup'
  );

  // ============================================
  // Phase 5: Left Bottom Table
  // ============================================
  await showPhase(page, 'Left Bottom Table', 5, 7);

  // Step 18: Click first element in the left bottom table (Session table)
  await clickWithMouseMove(
    page,
    page.getByRole('gridcell', { name: 'fiber_manual_record' }).first(),
    'First Session Row'
  );

  // Wait for popup to appear
  await page.waitForTimeout(1000);

  // Step 19-21: Click through tabs in the popup
  // Click SQL History tab
  await clickWithMouseMove(page, page.getByText('SQL History'), 'SQL History Tab');
  await page.waitForTimeout(500);

  // Click Open Cursor tab
  await clickWithMouseMove(page, page.getByText('Open Cursor'), 'Open Cursor Tab');
  await page.waitForTimeout(500);

  // Click remaining tabs
  await clickWithMouseMove(page, page.getByText('* I/O'), '* I/O Tab');
  await page.waitForTimeout(500);

  await clickWithMouseMove(page, page.getByLabel(/Session Detail/).getByText('Lock', { exact: true }), 'Lock Tab');
  await page.waitForTimeout(500);

  await clickWithMouseMove(page, page.getByText('* PQ'), '* PQ Tab');
  await page.waitForTimeout(500);

  await clickWithMouseMove(page, page.getByText('* Access'), '* Access Tab');
  await page.waitForTimeout(500);

  await clickWithMouseMove(page, page.getByLabel(/Session Detail/).getByText('Transaction', { exact: true }), 'Transaction Tab');
  await page.waitForTimeout(500);

  await clickWithMouseMove(page, page.getByText('* Session Longops'), '* Session Longops Tab');
  await page.waitForTimeout(500);

  await clickWithMouseMove(page, page.getByText('RBS'), 'RBS Tab');
  await page.waitForTimeout(500);

  await clickWithMouseMove(page, page.getByText('Connect Info'), 'Connect Info Tab');
  await page.waitForTimeout(500);

  // Step 22: Click "SQL Info" header on the right side
  await clickWithMouseMove(
    page,
    page.getByRole('dialog').last().getByText('SQL Info'),
    'SQL Info Header'
  );

  // Step 23: Click "Plan" header on the right side
  await clickWithMouseMove(
    page,
    page.getByRole('listitem').filter({ hasText: 'Plan' }),
    'Plan Header'
  );

  // Step 24: Close the popup
  await clickWithMouseMove(
    page,
    page.getByRole('dialog').last().getByRole('button', { name: 'close' }),
    'Close Session Detail Popup'
  );

  // ============================================
  // Phase 6: Right Bottom Table (Event Table)
  // ============================================
  await showPhase(page, 'Right Bottom Table', 6, 7);

  // Step 25: Click first element in the right bottom table (Event table)
  // Match any of the three level types: Critical, Warning, or Normal
  await clickWithMouseMove(
    page,
    page.getByRole('gridcell', { name: /Critical|Warning|Normal/ }).first(),
    'First Event Row'
  );

  // Wait for popup to appear
  await page.waitForTimeout(1000);

  // Step 26: Click "Confirm" button
  await clickWithMouseMove(
    page,
    page.getByText('Confirm', { exact: true }),
    'Confirm Button'
  );

  // Step 27: Click "OK" button
  await page.waitForTimeout(500);
  await clickWithMouseMove(
    page,
    page.getByRole('button', { name: 'OK' }),
    'OK Button'
  );

  // ============================================
  // Phase 7: Cleanup
  // ============================================
  await showPhase(page, 'Cleanup', 7, 7);

  // Step 28: Click Activity in sidebar
  await clickWithMouseMove(
    page,
    page.getByRole('link', { name: 'Activity' }),
    'Activity'
  );

  // Wait for Activity page to load
  await page.waitForTimeout(2000);

  // Step 29-30: Remove all test UI overlays
  await page.evaluate(() => {
    // Remove all test overlay elements
    const overlayIds = [
      'test-progress-bar',
      'test-action-display',
      'test-metadata',
      'test-phase',
      'test-message-overlay'
    ];
    overlayIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });
  });

  // Test complete - just display the Activity page
  await page.waitForTimeout(2000);
});
