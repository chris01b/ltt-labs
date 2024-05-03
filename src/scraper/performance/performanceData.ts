import { Page } from 'puppeteer';
import { waitForChartToLoad } from '../utils/charts';
import { GameTestResult, GameReport } from '../types/gameReport';

// Only keep data for article's GPU
export function parsePerformanceData(jsonData: GameReport): GameTestResult[] {
    return jsonData.baseTestResult;
}

export async function getPerformanceData(page: Page): Promise<[GameTestResult[], GameTestResult[]]> {
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
