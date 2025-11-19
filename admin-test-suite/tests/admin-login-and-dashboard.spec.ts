import { test, expect, Page } from '@playwright/test';

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
  // Install mouse helper before navigation
  await installMouseHelper(page);

  // Go to the root first
  await page.goto('/');

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
}

async function clickWithMouseMove(page: Page, locator: any) {
  const box = await locator.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 30 });
    await page.waitForTimeout(300);
  }
  await locator.click();
  await page.waitForTimeout(5000);
}

async function runDashboardScenario(page: Page) {
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Session' }));
  await clickWithMouseMove(page, page.getByText('Lock', { exact: true }));
  await clickWithMouseMove(page, page.getByText('Transaction'));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'RAC', exact: true }));
  await clickWithMouseMove(page, page.getByRole('button', { name: 'RAC19CDB' }));
  await clickWithMouseMove(page, page.getByText('Performance Performance'));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Performance' }));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'UltraSessionSnapshot' }));
  await clickWithMouseMove(page, page.getByText('Top SQL'));
  await clickWithMouseMove(page, page.getByText('Top Event'));
  await clickWithMouseMove(page, page.getByText('Top Session'));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Wait Analysis' }));
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'Wait Event' }));
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'Active Session Elapsedtime(' }));
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'Active Session I/O(Block)' }));
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'CPU (Session)' }));
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'Sysstat' }).first());
  await clickWithMouseMove(page, page.getByRole('link', { name: 'SQL Analysis' }));
  await clickWithMouseMove(page, page.getByRole('listitem').filter({ hasText: 'SQL Square Map' }));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Session Square Map' }));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'SQL Scatter View' }));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Top SQL Map' }));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Change Tracking' }));
  await clickWithMouseMove(page, page.getByText('Object Change History'));
  await clickWithMouseMove(page, page.getByText('Parameter History'));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Capacity Management' }));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'ASM Info' }));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Event Analysis' }));
  await clickWithMouseMove(page, page.getByText('AlertLog List'));
  await clickWithMouseMove(page, page.getByText('Event EZIS List'));
  await clickWithMouseMove(page, page.getByText('-11-19 11:24:33'));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Trace File' }));
  await clickWithMouseMove(page, page.getByText('Report Long Term AWR Report'));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'Long Term' }));
  await clickWithMouseMove(page, page.getByRole('link', { name: 'AWR Report' }));
}

test('Admin dashboard – login and smooth visual scenario (3x)', async ({ page }) => {
  await loginIfNeeded(page);

  for (let i = 0; i < 3; i++) {
    console.log(`Scenario run #${i + 1}`);
    await runDashboardScenario(page);
  }
});
