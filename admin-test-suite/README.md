# Admin UI Test Suite (Playwright)

This project uses Playwright to test an internal database monitoring dashboard at http://192.168.5.2:8080.

## 1. Install dependencies

npm install
npx playwright install

## 2. Run tests

### Headed mode (recommended for visual demo)
npm run test:headed

### UI mode (Playwright Test Runner GUI)
npm run test:ui

### Normal CLI run
npm test

## 3. Adjusting login selectors with Playwright Inspector

1. Run:

   npx playwright codegen http://192.168.5.2:8080

2. A browser and an Inspector window will open.
3. On the login page:
   - Click in the username field. Inspector will show a line like:
     await page.getByLabel('User ID').fill('value');
   - Click in the password field. Copy the generated line.
   - Click the login button. Copy that locator as well.
4. Replace the placeholder lines in `loginIfNeeded` inside
   tests/admin-login-and-dashboard.spec.ts with the real locators from Inspector.

After that, re-run:

npm run test:headed

and you will see:
- Browser opening to 192.168.5.2:8080
- Automatic login with username `admin` and password `dlwltm`
- Smooth scrolling and navigation across sidebar sections and event table.
