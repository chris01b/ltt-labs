import { Page } from 'puppeteer';
import { GameReport } from '../types/gameReport';

/**
 * Fetches and processes performance data for gaming and ray tracing based on stored session IDs.
 *
 * @param {Page} page - The Puppeteer Page instance.
 * @param {Map<string, string[]>} sessionIdsMap - A map of performance categories to their respective session IDs.
 * @returns {Promise<[GameReport[], GameReport[]]>} - A tuple containing arrays of gaming and ray tracing performance data.
 */
export async function getPerformanceData(page: Page, sessionIdsMap: Map<string, string[]>): Promise<[GameReport[], GameReport[]]> {
    let gamingPerformance: GameReport[] = [];
    let rayTracingPerformance: GameReport[] = [];

    // Process each category and fetch the corresponding data from the window object.
    for (const [key, ids] of sessionIdsMap) {
        const data: GameReport[] = await page.evaluate((key) => {
            return window[key] ? window[key] : [];
        }, key);

        // Assign the fetched data to the correct category.
        if (key === "Gaming Performance") {
            gamingPerformance = data;
        } else if (key === "Ray Tracing Performance") {
            rayTracingPerformance = data;
        }
    }

    return [gamingPerformance, rayTracingPerformance];
}
