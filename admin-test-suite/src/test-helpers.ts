import { Page, Locator, expect } from '@playwright/test';
import {
  showMessage,
  hideMessage,
  updateProgress,
  showAction,
  showMetadata,
  showPhase
} from './notifications';

// Test state tracker
let currentStep = 0;
let totalSteps = 0;

// State management functions
export function setTotalSteps(total: number) {
  totalSteps = total;
}

export function resetStepCounter() {
  currentStep = 0;
}

export function getCurrentStep() {
  return currentStep;
}

export function getTotalSteps() {
  return totalSteps;
}

// Helper to inject a visible mouse pointer overlay
export async function installMouseHelper(page: Page) {
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

export async function moveMouseToElement(page: Page, selector: string) {
  const element = await page.locator(selector).first().boundingBox();
  if (element) {
    const x = element.x + element.width / 2;
    const y = element.y + element.height / 2;
    await page.mouse.move(x, y, { steps: 30 });
    await page.waitForTimeout(300);
  }
}

export async function moveMouseToCoordinates(page: Page, x: number, y: number) {
  await page.mouse.move(x, y, { steps: 30 });
  await page.waitForTimeout(300);
}

export async function loginIfNeeded(page: Page) {
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
    await hideMessage(page);
    return;
  }

  // Otherwise we are on the login screen
  const username = process.env.EZIS_ADMIN_USERNAME || 'admin';
  const password = process.env.EZIS_ADMIN_PASSWORD || '';

  await moveMouseToElement(page, 'article input[name="id"]');
  await page.getByRole('article').locator('input[name="id"]').click();
  await page.keyboard.type(username, { delay: 100 });
  await page.waitForTimeout(1000);

  await moveMouseToElement(page, 'article input[name="passwd"]');
  await page.getByRole('article').locator('input[name="passwd"]').click();
  await page.keyboard.type(password, { delay: 100 });

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

export async function clickWithMouseMove(page: Page, locator: Locator, actionName: string) {
  // IMPORTANT: Get element reference FIRST before showing any action text
  let element;
  try {
    // Wait for element to be available and get reference
    element = locator.first();
    await element.waitFor({ state: 'visible', timeout: 10000 });
  } catch (error) {
    console.log(`Warning: Step ${currentStep + 1}/${totalSteps} - ${actionName} element not found, skipping...`);
    await showAction(page, `⚠ Step ${currentStep + 1}/${totalSteps} - ${actionName} not found, skipping`, 'success');
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

  // Move mouse to element and click using mouse API
  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y, { steps: 30 });
    await page.waitForTimeout(200);
    // Use mouse.click so it uses our positioned mouse
    await page.mouse.click(x, y);
  } else {
    // Fallback to element.click if no box
    await element.click();
  }

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
  await page.waitForTimeout(1000);
}

// Double-click with mouse movement and visual feedback
export async function doubleClickWithMouseMove(page: Page, locator: Locator, actionName: string) {
  let element;
  try {
    element = locator.first();
    await element.waitFor({ state: 'visible', timeout: 10000 });
  } catch (error) {
    console.log(`Warning: Step ${currentStep + 1}/${totalSteps} - ${actionName} element not found, skipping...`);
    await showAction(page, `⚠ Step ${currentStep + 1}/${totalSteps} - ${actionName} not found, skipping`, 'success');
    await page.waitForTimeout(1000);
    return;
  }

  const box = await element.boundingBox();

  await showAction(page, `Double-clicking ${actionName}...`, 'running');

  // Highlight element
  if (box) {
    try {
      await page.evaluate((boxCoords) => {
        const element = document.elementFromPoint(boxCoords.x + boxCoords.width / 2, boxCoords.y + boxCoords.height / 2);
        if (element) {
          (element as HTMLElement).style.outline = '3px solid #F59E0B';
          (element as HTMLElement).style.outlineOffset = '2px';
        }
      }, box);
    } catch (e) {}
  }

  await page.waitForTimeout(300);

  // Move mouse to element and double-click using mouse API (not element.dblclick)
  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y, { steps: 30 });
    await page.waitForTimeout(200);
    // Use mouse.dblclick so it uses our positioned mouse
    await page.mouse.dblclick(x, y);
  } else {
    // Fallback to element.dblclick if no box
    await element.dblclick();
  }

  // Flash success
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
    } catch (e) {}
  }

  currentStep++;
  await page.waitForTimeout(500);
  await updateProgress(page, currentStep, totalSteps);
  await showAction(page, `✓ ${actionName} double-clicked`, 'success');
  await page.waitForTimeout(1000);
}

// Scroll within an element (dropdown or popup)
export async function scrollWithinElement(
  page: Page,
  locator: Locator,
  direction: 'down' | 'up',
  durationMs: number,
  actionName: string
) {
  let element;
  try {
    element = locator.first();
    await element.waitFor({ state: 'visible', timeout: 10000 });
  } catch (error) {
    console.log(`Warning: ${actionName} element not found, skipping scroll...`);
    return;
  }

  const box = await element.boundingBox();
  if (!box) return;

  await showAction(page, `Scrolling ${direction} in ${actionName}...`, 'running');

  // Move mouse to center of element
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  await page.mouse.move(centerX, centerY, { steps: 20 });

  // Calculate scroll parameters
  const scrollStep = direction === 'down' ? 100 : -100;
  const intervalMs = 50;
  const iterations = Math.floor(durationMs / intervalMs);

  // Perform gradual scroll using mouse wheel
  for (let i = 0; i < iterations; i++) {
    await page.mouse.wheel(0, scrollStep);
    await page.waitForTimeout(intervalMs);
  }

  await showAction(page, `✓ Scrolled ${direction} in ${actionName}`, 'success');
  await page.waitForTimeout(500);
}

// Drag with mouse movement and visual feedback
export async function dragWithMouseMove(
  page: Page,
  sourceLocator: Locator,
  sourceOffsetX: number,  // Offset from left edge (0-1 as percentage)
  sourceOffsetY: number,  // Offset from top edge (0-1 as percentage)
  targetOffsetX: number,  // Offset from left edge (0-1 as percentage)
  targetOffsetY: number,  // Offset from top edge (0-1 as percentage)
  actionName: string
) {
  let element;
  try {
    element = sourceLocator.first();
    await element.waitFor({ state: 'visible', timeout: 10000 });
  } catch (error) {
    console.log(`Warning: Step ${currentStep + 1}/${totalSteps} - ${actionName} element not found, skipping...`);
    await showAction(page, `⚠ Step ${currentStep + 1}/${totalSteps} - ${actionName} not found, skipping`, 'success');
    await page.waitForTimeout(1000);
    return;
  }

  const box = await element.boundingBox();
  if (!box) return;

  await showAction(page, `Dragging on ${actionName}...`, 'running');

  // Calculate source and target coordinates
  const sourceX = box.x + box.width * sourceOffsetX;
  const sourceY = box.y + box.height * sourceOffsetY;
  const targetX = box.x + box.width * targetOffsetX;
  const targetY = box.y + box.height * targetOffsetY;

  // Highlight the graph area
  try {
    await page.evaluate((boxCoords) => {
      const element = document.elementFromPoint(boxCoords.x + boxCoords.width / 2, boxCoords.y + boxCoords.height / 2);
      if (element) {
        (element as HTMLElement).style.outline = '3px solid #F59E0B';
        (element as HTMLElement).style.outlineOffset = '2px';
      }
    }, box);
  } catch (e) {}

  await page.waitForTimeout(300);

  // Move to source position
  await page.mouse.move(sourceX, sourceY, { steps: 30 });
  await page.waitForTimeout(300);

  // Press mouse down
  await page.mouse.down();
  await page.waitForTimeout(200);

  // Drag to target position with animation
  await page.mouse.move(targetX, targetY, { steps: 50 });
  await page.waitForTimeout(300);

  // Release mouse
  await page.mouse.up();

  // Flash success
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
  } catch (e) {}

  currentStep++;
  await page.waitForTimeout(500);
  await updateProgress(page, currentStep, totalSteps);
  await showAction(page, `✓ ${actionName} drag completed`, 'success');
  await page.waitForTimeout(2000);
}

// Close popup by clicking X button
export async function closePopupByX(page: Page, popupSelector: string, actionName: string) {
  await showAction(page, `Closing ${actionName}...`, 'running');

  // Find the popup
  const popup = page.locator(popupSelector);
  await popup.waitFor({ state: 'visible', timeout: 5000 });

  // Find and click the X button (common patterns)
  const closeButton = popup.locator('button:has-text("×"), button:has-text("X"), button[aria-label="close"], button[aria-label="Close"], .close-button, [class*="close"]').first();

  const box = await closeButton.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
    await page.waitForTimeout(200);
  }

  await closeButton.click();

  // Wait for popup to disappear
  await popup.waitFor({ state: 'hidden', timeout: 5000 });

  currentStep++;
  await updateProgress(page, currentStep, totalSteps);
  await showAction(page, `✓ ${actionName} closed`, 'success');
  await page.waitForTimeout(1000);
}

// Re-export notification functions for convenience
export { showMessage, hideMessage, updateProgress, showAction, showMetadata, showPhase };
