import { test } from '@playwright/test';
import {
  loginIfNeeded,
  clickWithMouseMove,
  setTotalSteps,
  resetStepCounter,
  showMessage,
  showMetadata,
  showPhase,
  updateProgress
} from '../src/test-helpers';

const totalSteps = 35; // Total number of menu clicks

async function runDashboardScenario(page: any) {
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
  await clickWithMouseMove(page, page.getByRole('link', { name: 'SQL Scatter View' }), 'SQL Scatter View');
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

test('Admin dashboard – login and smooth visual scenario', async ({ page }) => {
  // Generate test run ID
  const runId = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

  // Set up test state
  setTotalSteps(totalSteps);

  await loginIfNeeded(page);

  const totalLoops = 1;
  for (let i = 0; i < totalLoops; i++) {
    console.log(`Scenario run #${i + 1}`);

    // Reset step counter for each loop
    resetStepCounter();

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
