import { Page } from 'puppeteer';
import { expandSection } from '../utils';
import { parseSummary } from './summary';
import { Performance } from '../types';
import { fetchAndParsePerformanceData } from './performanceData';

export async function parsePerformance(page: Page): Promise<Performance> {
    let performance: Performance = {
        summary: null,
        gamingPerformance: null,
        rayTracingPerformance: null
    };

    try {
        // Expanding the performance section on the page
        await expandSection(page, '#performance > div > button', '#performance-summary', "Performance");

        // Parse summary data
        const summary = await parseSummary(page);
        performance.summary = summary;

        // Fetch and parse both gaming and ray tracing performance data
        const [gamingPerformance, rayTracingPerformance] = await fetchAndParsePerformanceData(page);
        performance.gamingPerformance = gamingPerformance;
        performance.rayTracingPerformance = rayTracingPerformance;

        // Validate data to ensure all required parts are parsed correctly
        if (!summary || !gamingPerformance || !rayTracingPerformance) {
            throw new Error("Failed to parse all performance components successfully.");
        }

        return performance;
    } catch (error) {
        console.error(`Error during performance parsing and aggregation: ${error}`);
        return performance;
    }
}
