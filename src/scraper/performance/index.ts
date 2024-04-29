import { Page } from 'puppeteer';
import { Performance } from '../types';

/**
 * Extracts the performance from the specified webpage after simulating a button click
 * that reveals the performance data. Handles dynamic content with increased timeout
 * and additional diagnostics.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The performance data if found, otherwise returns null.
 */
export async function parsePerformance(page: Page): Promise<Performance> {
    let performance: Performance = {
        summary: null,
        gamingPerformance: null,
        rayTracingPerformance: null
    }
    
    try {
        const buttonSelector = '#performance > div > button';
        const isOpenSelector = '#performance-summary';

        const button = await page.$(buttonSelector);
        const isOpen = await page.$(isOpenSelector);

        // Check if the summary is not already open
        if (!isOpen) {
            if (button) {
                await button.click();
                await page.waitForSelector(isOpenSelector, { timeout: 1000 });
            } else {
                console.log("Button to expand performance not found.");
                return performance; // Return null initialization if button not found
            }
        }

        // const [] = await Promise.all([]);

        return performance = {
            ...performance
        };
    } catch (error) {
        console.error(`Error fetching performance: ${error}`);
        return performance;
    }
}
