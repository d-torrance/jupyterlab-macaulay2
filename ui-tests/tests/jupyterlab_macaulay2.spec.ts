import { expect, test } from '@jupyterlab/galata';

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });

// TODO: actually test the package!
test('dummy test', async ({ page }) => {
  expect(true).toBe(true);
});
