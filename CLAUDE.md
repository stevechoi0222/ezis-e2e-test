# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright E2E test suite for testing the EZIS Admin Dashboard UI. The tests perform visual automation of admin dashboard navigation with visible mouse movement and progress overlays.

## Project Structure

- **Root level**: Contains a minimal package.json with Playwright dependency
- **admin-test-suite/**: Main test suite directory with its own package.json, dependencies, and configuration
  - `tests/`: Test spec files (*.spec.ts)
  - `src/`: Shared utilities (notifications.ts for visual overlays)
  - `playwright.config.ts`: Playwright configuration
  - `run-test.bat`: Windows batch script for running tests

## Commands

All commands should be run from the `admin-test-suite/` directory:

```bash
# Install dependencies
npm install
npx playwright install chromium

# Run all tests (headed mode with visible browser)
npm run test:headed

# Run all tests (headless)
npm test

# Run tests with Playwright UI
npm run test:ui

# Run a specific test file
npx playwright test tests/admin-login-and-dashboard.spec.ts

# Run tests and generate report
npx playwright test --reporter=html
```

For Windows users, use `run-test.bat` from the admin-test-suite directory for automated dependency check and test execution.

## Key Configuration

The Playwright config (`admin-test-suite/playwright.config.ts`) is set up for:
- **Base URL**: `http://192.168.5.2:8080` (local EZIS admin server)
- **Browser**: Chromium only
- **Viewport**: 1920x1080
- **Timeout**: 10 minutes per test
- **Visual feedback**: Video recording, trace capture, slowMo (150ms)
- **Headed mode**: Tests run with visible browser by default

## Environment Setup

- The EZIS server at `http://192.168.5.2:8080` is assumed to always be running. Server availability is not the test suite's responsibility.
- Credentials are stored in `.env` file (not committed to git). Copy `.env.example` to `.env` and fill in the credentials.

```bash
# admin-test-suite/.env
EZIS_ADMIN_USERNAME=your_username
EZIS_ADMIN_PASSWORD=your_password
```

## Architecture

### Visual Overlay System

The test suite includes a custom visual overlay system (`src/notifications.ts`) that provides:
- **Progress bar**: Shows test progress with step counter
- **Action display**: Shows current action being performed
- **Phase indicator**: Shows current test phase
- **Message overlays**: Info/success/error notifications

These overlays are injected into the page during tests for demonstration purposes.

### Test Helper Functions

Tests use several custom helper functions:
- `installMouseHelper()`: Adds visible mouse cursor overlay
- `moveMouseToElement()`: Animates mouse movement to elements
- `clickWithMouseMove()`: Combines mouse animation with click and progress tracking
- `loginIfNeeded()`: Handles authentication flow

### Test Phases

The dashboard scenario test is organized into 5 phases:
1. Session Management
2. RAC Monitoring
3. Performance Analysis
4. SQL & Session Analysis
5. System Management & Reporting

## Writing New Tests

New test scenarios should follow the same pattern as `admin-login-and-dashboard.spec.ts`:

1. Use `loginIfNeeded(page)` to handle authentication
2. Use `clickWithMouseMove(page, locator, actionName)` for navigation with visual feedback
3. Organize actions into phases using `showPhase(page, phaseName, current, total)`
4. Update `totalSteps` to match the number of menu clicks in the scenario

Future scenarios will test different dashboard workflows with different buttons/menus, but the visual automation style remains consistent.

## Known Issues

### Overlay Blocking UI Elements

The visual overlay system (progress bar, action display, phase indicator) can occasionally block clickable elements on the website, causing tests to fail because the element cannot be clicked.

**Symptoms:**
- Test fails with "element is not clickable at point" error
- Element is visible but covered by an overlay

**Solutions:**
- Adjust overlay positioning in `src/notifications.ts`
- Use `{ force: true }` on clicks if necessary (not recommended as first resort)
- Ensure overlays are positioned in corners/edges that don't overlap with navigation elements
