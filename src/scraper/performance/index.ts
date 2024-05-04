import { Page } from 'puppeteer';
import { expandSection } from '../utils';
import { parseSummary } from './summary';
import { getPerformanceData } from './performanceData';
import { extractSessionIds } from '../utils/charts';
import { Performance } from '../types';
import { GameReport } from '../types/gameReport';

export async function parsePerformance(page: Page): Promise<Performance> {
    let performance: Performance = {
        summary: null,
        gamingPerformance: null,
        rayTracingPerformance: null
    };

    try {
        // Enable request interception to handle responses dynamically
        await page.setRequestInterception(true);

        // Extract session IDs for both gaming and ray tracing sections
        const sessionIdsMap = await extractSessionIds(page, ["Gaming Performance", "Ray Tracing Performance"], "performance");

        page.on('request', interceptedRequest => {
            interceptedRequest.continue();
        });

        page.on('response', async response => {
            const url = response.url();
            sessionIdsMap.forEach((ids, key) => {
                ids.forEach(async id => {
                    if (url === `https://www.lttlabs.com/api/chart/data/gpu/gameReport/${id}`) {
                        const jsonData: GameReport = await response.json();
                        await page.evaluate((key, data) => {
                            window[key] = window[key] || [];
                            window[key].push(data);
                        }, key, jsonData);
                    }
                });
            });
        });

        // Expanding the performance section on the page to trigger client-side JS
        await expandSection(page, '#performance > div > button', '#performance-summary', "Performance");

        // Wait for data to be loaded into the browser context
        await page.waitForFunction((sessionIdsMap) => {
            return Object.entries(sessionIdsMap).every(([key, ids]) => {
                return window[key] && window[key].length === ids.length;
            });
        }, {}, sessionIdsMap);

        // Fetch and parse both gaming and ray tracing performance data after section expansion
        const [gamingPerformance, rayTracingPerformance] = await getPerformanceData(page, sessionIdsMap);
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
