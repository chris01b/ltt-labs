import { Page } from 'puppeteer';
import { PerformanceTestData, Game, Resolution } from '../types/performance';
import { extractPerformanceSessionId, fetchJsonDataFromUrls } from '../utils/charts';

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

export async function fetchAndParsePerformanceData(page: Page): Promise<[PerformanceTestData[], PerformanceTestData[]]> {
    const baseChartUrl = 'https://www.lttlabs.com/api/chart/data/gpu/gameReport/';

    try {
        // Extract session IDs for gaming and ray tracing performance data
        const gamingSessionId = await extractPerformanceSessionId(page, "Gaming Performance");
        const rayTracingSessionId = await extractPerformanceSessionId(page, "Ray Tracing Performance");

        // Validate session IDs before proceeding
        if (!gamingSessionId || !rayTracingSessionId) {
            throw new Error("Failed to extract session IDs for performance data.");
        }

        // Construct URLs for fetching data
        const urlsToFetch = [
            `${baseChartUrl}${gamingSessionId}`,
            `${baseChartUrl}${rayTracingSessionId}`
        ];

        // Fetch data concurrently for both gaming and ray tracing performance
        const results = await fetchJsonDataFromUrls(page, urlsToFetch);

        // Parse the fetched data
        const gamingPerformance = parsePerformanceData(results[0]);
        const rayTracingPerformance = parsePerformanceData(results[1]);

        // Check the parsed data for completeness and correctness
        if (gamingPerformance.length === 0 || rayTracingPerformance.length === 0) {
            throw new Error("Parsed performance data is incomplete or incorrect.");
        }

        return [gamingPerformance, rayTracingPerformance];
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error fetching or parsing performance data: ${error.message}`);
            throw new Error(`Performance data processing failed: ${error.message}`);
        } else {
            // Handle the case where error is not an instance of Error
            console.error('An unexpected error occurred:', error);
            throw new Error('Performance data processing failed due to an unexpected error.');
        }
    }
}
