import { Page } from '@playwright/test';

interface NotificationConfig {
  icon: string;
  background: string;
  color: string;
  shadow: string;
  top: string;
}

const notificationConfigs: Record<'info' | 'success' | 'error', NotificationConfig> = {
  info: {
    icon: '🔵',
    background: '#F9F9F9',
    color: '#FFFFFF',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    top: '5%'
  },
  success: {
    icon: '✅',
    background: '#F9F9F9',
    color: '#FFFFFF',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    top: '5%'
  },
  error: {
    icon: '❌',
    background: '#F9F9F9',
    color: '#FFFFFF',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    top: '10%'
  }
};

// Progress bar and step counter
export async function updateProgress(page: Page, current: number, total: number) {
  const percentage = Math.round((current / total) * 100);

  try {
    await page.evaluate(({ current, total, percentage }) => {
    let progressBar = document.getElementById('test-progress-bar');

    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'test-progress-bar';
      progressBar.setAttribute('data-testid', 'e2e-progress-overlay'); // Add data attribute to exclude from searches
      progressBar.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 800px;
        background: rgba(255, 255, 255, 0.35);
        border-radius: 12px;
        padding: 20px 32px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 9999998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        backdrop-filter: blur(10px);
        pointer-events: none;
      `;
      document.body.appendChild(progressBar);
    }

    progressBar.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 16px; font-weight: 600; color: #FFF;">Test Progress</span>
        <span style="font-size: 16px; font-weight: 600; color: #FFF;">Step ${current}/${total} • ${percentage}%</span>
      </div>
      <div style="width: 100%; height: 10px; background: rgba(255, 255, 255, 0.3); border-radius: 5px; overflow: hidden;">
        <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%); transition: width 0.3s ease;"></div>
      </div>
    `;
  }, { current, total, percentage });
  } catch (error) {
    // Page navigated, ignore
  }
}

// Live action display
export async function showAction(page: Page, action: string, status: 'running' | 'success' = 'running') {
  try {
    await page.evaluate(({ action, status }) => {
    let actionDisplay = document.getElementById('test-action-display');

    if (!actionDisplay) {
      actionDisplay = document.createElement('div');
      actionDisplay.id = 'test-action-display';
      actionDisplay.setAttribute('data-testid', 'e2e-action-overlay'); // Add data attribute to exclude from searches
      actionDisplay.style.cssText = `
        position: fixed;
        top: 110px;
        left: 50%;
        transform: translateX(-50%);
        min-width: 400px;
        max-width: 600px;
        background: rgba(255, 255, 255, 0.35);
        border-radius: 10px;
        padding: 12px 20px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        z-index: 9999997;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 15px;
        transition: all 0.3s ease;
        pointer-events: none;
        backdrop-filter: blur(10px);
      `;
      document.body.appendChild(actionDisplay);
    }

    const icon = status === 'running' ? '▶' : '✓';
    const color = status === 'running' ? '#60A5FA' : '#34D399';

    actionDisplay.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="color: ${color}; font-size: 16px; font-weight: bold;">${icon}</span>
        <span style="color: #FFF;" data-testid="e2e-action-text">${action}</span>
      </div>
    `;
  }, { action, status });
  } catch (error) {
    // Page navigated, ignore
  }
}

// Test metadata overlay
export async function showMetadata(page: Page, testName: string, runId: string, currentLoop: number, totalLoops: number) {
  try {
    await page.evaluate(({ testName, runId, currentLoop, totalLoops }) => {
    let metadata = document.getElementById('test-metadata');

    if (!metadata) {
      metadata = document.createElement('div');
      metadata.id = 'test-metadata';
      metadata.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.35);
        color: #FFF;
        border-radius: 8px;
        padding: 12px 16px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.6;
        z-index: 9999996;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
      `;
      document.body.appendChild(metadata);
    }

    metadata.innerHTML = `
      <div><strong>Test:</strong> ${testName}</div>
      <div><strong>Run:</strong> ${runId}</div>
      <div><strong>Loop:</strong> ${currentLoop}/${totalLoops}</div>
      <div><strong>Status:</strong> <span style="color: #10B981;">● Running</span></div>
    `;
  }, { testName, runId, currentLoop, totalLoops });
  } catch (error) {
    // Page navigated, ignore
  }
}

// Phase indicator
export async function showPhase(page: Page, phaseName: string, phaseNumber: number, totalPhases: number) {
  try {
    await page.evaluate(({ phaseName, phaseNumber, totalPhases }) => {
    let phaseDisplay = document.getElementById('test-phase');

    if (!phaseDisplay) {
      phaseDisplay = document.createElement('div');
      phaseDisplay.id = 'test-phase';
      phaseDisplay.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(102, 126, 234, 0.35);
        color: white;
        border-radius: 24px;
        padding: 10px 24px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
        z-index: 9999995;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        animation: phaseSlideIn 0.5s ease;
        backdrop-filter: blur(10px);
      `;

      // Add animation
      if (!document.getElementById('phase-animation')) {
        const style = document.createElement('style');
        style.id = 'phase-animation';
        style.textContent = `
          @keyframes phaseSlideIn {
            from { transform: translate(-50%, 100px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(phaseDisplay);
    }

    phaseDisplay.innerHTML = `Phase ${phaseNumber}/${totalPhases}: ${phaseName}`;
  }, { phaseName, phaseNumber, totalPhases });
  } catch (error) {
    // Page navigated, ignore
  }
}

// Element highlighting
export async function highlightElement(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);
    elements.forEach(element => {
      (element as HTMLElement).style.outline = '3px solid #F59E0B';
      (element as HTMLElement).style.outlineOffset = '2px';
      (element as HTMLElement).style.transition = 'outline 0.2s ease';
    });
  }, selector);
}

export async function unhighlightElement(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);
    elements.forEach(element => {
      (element as HTMLElement).style.outline = 'none';
    });
  }, selector);
}

export async function flashSuccess(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);
    elements.forEach(element => {
      (element as HTMLElement).style.outline = '3px solid #10B981';
      (element as HTMLElement).style.outlineOffset = '2px';
      setTimeout(() => {
        (element as HTMLElement).style.outline = 'none';
      }, 500);
    });
  }, selector);
}

export async function showMessage(page: Page, message: string, type: 'info' | 'success' | 'error' = 'info') {
  const config = notificationConfigs[type];

  try {
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
      `;
      document.head.appendChild(style);
    }

    // Create message overlay
    setTimeout(() => {
      const messageBox = document.createElement('div');
      messageBox.id = 'test-message';
      messageBox.innerHTML = `
        <span style="position: absolute; left: 30px; font-size: 32px;">${config.icon}</span>
        <span>${msg}</span>
      `;
      messageBox.style.cssText = `
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 0px 40px;
        gap: 16px;
        position: fixed;
        width: 440px;
        height: 64px;
        left: 50%;
        top: ${config.top};
        transform: translateX(-50%);
        background: rgba(249, 249, 249, 0.35);
        color: ${config.color};
        border-radius: 10px;
        font-size: 18px;
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 9999999;
        box-shadow: ${config.shadow};
        animation: slideDown 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        backdrop-filter: blur(10px);
      `;
      document.body.appendChild(messageBox);
    }, 50);
  }, { msg: message, config });
  } catch (error) {
    // Page might have navigated, ignore this error
    console.log('Could not show message (page navigated):', message);
  }
}

export async function hideMessage(page: Page) {
  await page.evaluate(() => {
    const existing = document.getElementById('test-message');
    if (existing) existing.remove();
  });
}
