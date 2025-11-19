import { test, expect, Page } from '@playwright/test';

// Helper to show messages on screen
async function showMessage(page: Page, message: string, type: 'info' | 'success' | 'error' = 'info') {
  const configs = {
    info: {
      icon: '🔵',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shadow: '0 10px 40px rgba(102, 126, 234, 0.4)'
    },
    success: {
      icon: '✅',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      shadow: '0 10px 40px rgba(56, 239, 125, 0.4)'
    },
    error: {
      icon: '❌',
      gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
      shadow: '0 10px 40px rgba(244, 92, 67, 0.4)'
    }
  };

  await page.evaluate(({ msg, config }) => {
    // Remove existing message if any
    const existing = document.getElementById('test-message');
    if (existing) {
      existing.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => existing.remove(), 300);
    }

    // Add animations and styles
    if (!document.getElementById('test-message-styles')) {
      const style = document.createElement('style');
      style.id = 'test-message-styles';
      style.textContent = `
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          to {
            transform: translate(-50%, -100px);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, 0) scale(1.02); }
        }
      `;
      document.head.appendChild(style);
    }

    // Create message overlay
    setTimeout(() => {
      const messageBox = document.createElement('div');
      messageBox.id = 'test-message';
      messageBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
          <span style="font-size: 32px;">${config.icon}</span>
          <span>${msg}</span>
        </div>
      `;
      messageBox.style.cssText = `
        position: fixed;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${config.gradient};
        color: white;
        padding: 24px 48px;
        border-radius: 16px;
        font-size: 28px;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 9999999;
        box-shadow: ${config.shadow};
        animation: slideDown 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), pulse 2s ease-in-out infinite 1s;
        backdrop-filter: blur(10px);
        letter-spacing: 0.5px;
      `;
      document.body.appendChild(messageBox);
    }, 50);
  }, { msg: message, config: configs[type] });
}

async function hideMessage(page: Page) {
  await page.evaluate(() => {
    const existing = document.getElementById('test-message');
    if (existing) existing.remove();
  });
}

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

  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');

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

  // Wait 20 seconds to show the dashboard
  await page.waitForTimeout(20000);

  // Show testing message
  await showMessage(page, '자동 테스트 진행 중...', 'info');
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

  // Show completion message
  await showMessage(page, '✓ 테스트 완료! 모든 기능이 정상 작동합니다.', 'success');
  await page.waitForTimeout(5000);
});
