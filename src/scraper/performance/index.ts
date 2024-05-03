import { Page } from 'puppeteer';
import { expandSection } from '../utils';
import { parseSummary } from './summary';
import { getPerformanceData } from './performanceData';
import { extractSessionId } from '../utils/charts';
import { Performance } from '../types';
import { GameReport } from '../types/gameReport';

export async function parsePerformance(page: Page): Promise<Performance> {
    let performance: Performance = {
        summary: null,
        gamingPerformance: null,
        rayTracingPerformance: null
    };

    try {
        // Enable request interception before expanding sections
        await page.setRequestInterception(true);

        const gamingSessionId = await extractSessionId(page, "Gaming Performance", "performance");
        const rayTracingSessionId = await extractSessionId(page, "Ray Tracing Performance", "performance");

        page.on('request', interceptedRequest => {
            interceptedRequest.continue();
        });

        // Set up response handling
        page.on('response', async response => {
            const url = response.url();

            // Store the JSON directly in the browser context when the response arrives
            if (url.includes(gamingSessionId)) {
                const jsonData: GameReport = await response.json();
                await page.evaluate((data) => {
                    window.gamingPerformanceData = data;
                }, jsonData);
            } else if (url.includes(rayTracingSessionId)) {
                const jsonData: GameReport = await response.json();
                await page.evaluate((data) => {
                    window.rayTracingPerformanceData = data;
                }, jsonData);
            }
        });

        // Expanding the performance section on the page to trigger client-side JS
        await expandSection(page, '#performance > div > button', '#performance-summary', "Performance");

        // Wait for both data sets to be loaded
        await page.waitForFunction(() => {
            return window.gamingPerformanceData && window.rayTracingPerformanceData;
        });

        // Fetch and parse both gaming and ray tracing performance data after section expansion
        const [gamingPerformance, rayTracingPerformance] = await getPerformanceData(page);
        performance.gamingPerformance = gamingPerformance;
        performance.rayTracingPerformance = rayTracingPerformance;

        // Parse summary data
        const summary = await parseSummary(page);
        performance.summary = summary;

        // Validate data to ensure all required parts are parsed correctly
        if (!summary || !gamingPerformance || !rayTracingPerformance) {
            throw new Error("Failed to parse all performance components successfully.");
        }

        return performance;
    } catch (error) {
        console.error(`Error during performance parsing and aggregation: ${error}`);
        return performance;  // Return the partially parsed performance data, if any
    } finally {
        // Disable request interception after processing is complete
        await page.setRequestInterception(false);
    }
}
