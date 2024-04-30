import { Page } from 'puppeteer';
import { expandSection } from '../utils';
import { parseSummary } from './summary';
import { parseGamingPerformance } from './gamingPerformance';
import { initializePage } from '../utils';
import { extractGamingPerformanceSessionId } from '../utils/charts';
import { Performance } from '../types';

export async function parsePerformance(page: Page): Promise<Performance> {
    let performance: Performance = {
        summary: null,
        gamingPerformance: null,
        rayTracingPerformance: null
    };

    try {
        const buttonSelector = '#performance > div > button';
        const isOpenSelector = '#performance-summary';
        
        // Ensure the performance section is expanded to trigger network responses
        await expandSection(page, buttonSelector, isOpenSelector, "Performance");

        // Fetch session ID for gaming performance
        const sessionId = await extractGamingPerformanceSessionId(page);
        const responseUrl = `https://www.lttlabs.com/api/chart/data/gpu/gameReport/${sessionId}`;

        // Initialize a new page for fetching the JSON data
        const { browser: jsonBrowser, page: jsonPage } = await initializePage();
        const response = await jsonPage.goto(responseUrl);
        const gamingData = await response?.json(); // Assuming the response is JSON

        // Close the JSON browser after fetching data
        await jsonBrowser.close();

        const summary = await parseSummary(page);
        const gamingPerformance = parseGamingPerformance(gamingData);

        return {
            ...performance,
            summary,
            gamingPerformance
        };
    } catch (error) {
        console.error(`Error fetching performance: ${error}`);
        return performance;
    }
}
