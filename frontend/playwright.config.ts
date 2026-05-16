import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Gatecode E2E smoke tests.
 *
 * Assumes:
 *   - Backend is reachable at NEXT_PUBLIC_BACKEND_URL (default http://localhost:8084).
 *   - Frontend dev server is running at http://localhost:3000.
 *
 * Both must be started externally before invoking `npx playwright test`
 * — see frontend/E2E_TEST_REPORT.md for the recipe.
 */
export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 60_000,
	expect: { timeout: 10_000 },
	fullyParallel: false, // Backend judge is sequential; avoid Docker pool exhaustion.
	workers: 1,
	retries: 0,
	reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
	outputDir: "test-results",
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "off",
		viewport: { width: 1440, height: 900 },
		ignoreHTTPSErrors: true,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
