/// <reference path="../../@types/global.d.ts" />
import { Page } from 'puppeteer';

interface BenchmarkGraph {
    sessionIds: string[];
    graphType: string;
}

interface Section {
    title: string;
    layout: string;
    content: {
        benchmarkGraphs: BenchmarkGraph[];
        metadataAttributes: any[];
    };
    comments: string | null;
    assets: any[];
}

/**
 * Extracts performance hydration data from Next.js scripts on a page.
 * 
 * @param {Page} page - The Puppeteer Page instance.
 * @returns {Promise<any>} - Resolves to the performance data or null if not found.
 */
export async function extractPerformanceHydrationData(page: Page): Promise<any> {
    return await page.evaluate(() => {
        const performanceData = self.__next_f
            .filter(item => item[0] === 1)  // Filter to types marked as '1'
            .map(item => item[1])           // Extract the data part of each item
            .join('')                       // Combine all items into a single string
            .split('\n')                    // Split into lines to process individual JSON objects
            .map(line => line.trim())       // Trim whitespace
            .filter(line => line)           // Remove empty lines
            .map(line => {
                const [key, ...valueParts] = line.split(':'); // Split line at the first colon to separate key from value
                const value = valueParts.join(':').trim();   // Rejoin value parts to preserve JSON structure
                try {
                    return JSON.parse(value);  // Parse the reconstructed JSON value
                } catch (error) {
                    return null;  // Ignore lines that do not contain valid JSON
                }
            })
            .find(parsed => Array.isArray(parsed) && parsed.length > 3 && parsed[2] === "performance");
        
        // Return the fourth element of the matched array if found
        return performanceData ? performanceData[3] : null;
    });
}

/**
 * Extracts the session ID for gaming performance from Next.js hydration data on a page.
 *
 * @param {Page} page - The Puppeteer Page instance.
 * @returns {Promise<string | null>} - A promise that resolves to the session ID needed for fetching the graph data,
 *                                     or null if no session ID is found.
 */
export async function extractGamingPerformanceSessionId(page: Page): Promise<string | null> {
    const performanceObject = await extractPerformanceHydrationData(page);
    // console.log(performanceObject);

    // Check if the 'sections' exist and contain the expected 'Gaming Performance' data
    const gamingPerformanceSection = performanceObject.category.sections.find((section: Section) => section.title === "Gaming Performance");

    if (gamingPerformanceSection && gamingPerformanceSection.content.benchmarkGraphs.length > 0) {
        const sessionIds = gamingPerformanceSection.content.benchmarkGraphs[0].sessionIds;
        if (sessionIds && sessionIds.length > 0) {
            return sessionIds[0] as string; // Return the first session ID found
        }
    }

    return null;
}
