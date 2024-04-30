import { GamingPerformanceTestData, DataPoint, Game, Resolution } from '../types/gamingPerformance';

/**
 * Parses gaming performance data from the provided JSON data.
 * 
 * @param jsonData - The JSON data fetched from the API.
 * @returns {GamingPerformanceTestData[]} - Array of gaming performance test data.
 */
export function parseGamingPerformance(jsonData: any): GamingPerformanceTestData[] {
    return jsonData.baseTestResult.map((item: any) => ({
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
}
