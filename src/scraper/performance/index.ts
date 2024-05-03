import { Page } from 'puppeteer';
import { expandSection } from '../utils';
import { parseSummary } from './summary';
import { Performance } from '../types';
import { fetchAndParsePerformanceData } from './performanceData';
import { extractPerformanceSessionId } from '../utils/charts';

export async function parsePerformance(page: Page): Promise<Performance> {
    let performance: Performance = {
        summary: null,
        gamingPerformance: null,
        rayTracingPerformance: null
    };

    try {
        // Enable request interception before expanding sections
        await page.setRequestInterception(true);

        const gamingSessionId = await extractPerformanceSessionId(page, "Gaming Performance");
        const rayTracingSessionId = await extractPerformanceSessionId(page, "Ray Tracing Performance");

        page.on('request', interceptedRequest => {
            interceptedRequest.continue();
        });

        // Set up response handling
        page.on('response', async response => {
            const url = response.url();
            const baseChartUrl = 'https://www.lttlabs.com/api/chart/data/gpu/gameReport/';

            // Store the JSON directly in the browser context when the response arrives
            if (url.includes(gamingSessionId)) {
                const jsonData = await response.json();
                await page.evaluate((data) => {
                    window.gamingPerformanceData = data;
                }, jsonData);
            } else if (url.includes(rayTracingSessionId)) {
                const jsonData = await response.json();
                await page.evaluate((data) => {
                    window.rayTracingPerformanceData = data;
                }, jsonData);
            }
        });

        // Expanding the performance section on the page to trigger client-side JS
        await expandSection(page, '#performance > div > button', '#performance-summary', "Performance");
        // await page.waitForSelector('#dynamicElement', { visible: true });

        // Wait for both data sets to be loaded
        await page.waitForFunction(() => {
            return window.gamingPerformanceData && window.rayTracingPerformanceData;
        });

        // Fetch and parse both gaming and ray tracing performance data after section expansion
        const [gamingPerformance, rayTracingPerformance] = await fetchAndParsePerformanceData(page);
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
