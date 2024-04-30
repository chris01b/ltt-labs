import { Page } from 'puppeteer';
import { expandSection } from '../utils';
import { parseSummary } from './summary';
import { parseGamingPerformance } from './gamingPerformance';
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
        
        const performanceSectionName = "Features & Software";
        const result = await expandSection(page, buttonSelector, isOpenSelector, performanceSectionName);

        const summary = await parseSummary(page);
        const gamingPerformance = await parseGamingPerformance(page, 'GeForce RTX 4080 SUPER');

        return performance = {
            ...performance,
            summary,
            gamingPerformance
        };
    } catch (error) {
        console.error(`Error fetching performance: ${error}`);
        return performance;
    }
}
