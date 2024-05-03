import { Page } from 'puppeteer';
import { waitForChartToLoad } from '../utils/charts';
import { PerformanceTestData, Game, Resolution } from '../types/performance';

export function parsePerformanceData(jsonData: any): PerformanceTestData[] {
    let performanceData: PerformanceTestData[];
    try {
        performanceData = jsonData.baseTestResult.map((item: any) => ({
            game: item.friendlyTest as Game,
            resolution: Resolution[`R${item.friendlyResolution.split('x')[1]}` as keyof typeof Resolution],
            fpsData: {
                averageFPS: item.average,
                onePercentLowFPS: item.p1,
                minFPS: item.min,
                maxFPS: item.max,
                percent99FPS: item.p99,
                percent95FPS: item.p95,
                percent5FPS: item.p5
            }
        }));
        if (!performanceData.length) {
            throw new Error('No performance data found');
        }
    } catch (error) {
        console.error(`Error parsing performance data from response: ${error}`);
        performanceData = [];
    }
    return performanceData;
}

/**
 * Fetches and parses gaming and ray tracing performance data.
 * Assumes that data loading flags have been set in the browser environment.
 *
 * @param {Page} page - The Puppeteer Page instance used to intercept requests.
 * @returns {Promise<[PerformanceTestData[], PerformanceTestData[]]>} A tuple containing arrays of performance data for gaming and ray tracing.
 */
export async function fetchAndParsePerformanceData(page: Page): Promise<[PerformanceTestData[], PerformanceTestData[]]> {
    try {

        await waitForChartToLoad(page, '#gaming-performance', 1500);

        // Retrieve the raw data directly from the browser context
        const rawGamingData = await page.evaluate(() => {
            return window.gamingPerformanceData ? JSON.stringify(window.gamingPerformanceData) : null;
        });

        await waitForChartToLoad(page, '#ray-tracing-performance', 1500);

        const rawRayTracingData = await page.evaluate(() => {
            return window.rayTracingPerformanceData ? JSON.stringify(window.rayTracingPerformanceData) : null;
        });

        // Parse the data in the Node.js context
        const gamingPerformance = rawGamingData ? parsePerformanceData(JSON.parse(rawGamingData)) : [];
        const rayTracingPerformance = rawRayTracingData ? parsePerformanceData(JSON.parse(rawRayTracingData)) : [];

        if (gamingPerformance.length === 0 || rayTracingPerformance.length === 0) {
            throw new Error("Parsed performance data is incomplete or incorrect.");
        }

        return [gamingPerformance, rayTracingPerformance];
    } catch (error) {
        console.error(`Error fetching or parsing performance data: ${error}`);
        throw new Error(`Performance data processing failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
}
