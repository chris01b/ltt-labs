import { Page } from 'puppeteer';
import { GamingPerformanceTestData, DataPoint, Game, Resolution } from '../types/gamingPerformance';
import { waitForChartToLoad, selectFromDropdown } from '../utils/charts';

/**
 * Logs the chart data along with corresponding series names or labels.
 * @param {string} labelToFind - The label of the data point to log.
 * @param {string[]} data - Array of data points as strings.
 * @param {string[]} legendLabels - Array of legend labels corresponding to the data points.
 */
function logChartData(labelToFind: string, data: string[], legendLabels: string[]): void {
    const output = data.map((value, idx) => `${legendLabels[idx] || `Series ${idx}`}: ${value}`).join(', ');
    console.log(`Data for ${labelToFind}: ${output}`);
}

/**
 * Fetches chart data for a specified label within a chart.
 * @param {Page} page - The Puppeteer Page instance.
 * @param {string} chartSelector - CSS selector for the chart container.
 * @param {string} labelToFind - Label text to find within the chart.
 * @returns {Promise<DataPoint>} - Returns the data point containing average and low FPS.
 */
async function fetchChartData(page: Page, chartSelector: string, labelToFind: string): Promise<DataPoint> {
    const labelsSelector = `${chartSelector} .highcharts-xaxis-labels span`;
    const labels = await page.$$eval(labelsSelector, (spans: Element[]) => spans.map(span => span.textContent?.trim() || ''));
    const labelIndex = labels.findIndex((label: string) => label === labelToFind);

    if (labelIndex === -1) {
        throw new Error(`Label not found. Labels length: ${labels.length}, Available labels: ${labels.join(', ')}`);
    }

    const data = await Promise.all([
        fetchSeriesData(page, chartSelector, 0, labelIndex),
        fetchSeriesData(page, chartSelector, 1, labelIndex)
    ]);

    const legendLabels = await page.$$eval(`${chartSelector} .bg-custom-chart-bg button .text-left`, (divs: Element[]) => divs.map(div => div.textContent || '')) as string[];
    // logChartData(labelToFind, data, legendLabels);

    return {
        averageFPS: parseFloat(data[0]),
        onePercentLowFPS: parseFloat(data[1])
    };
}

/**
 * Fetches data for a specific series within a chart.
 * @param {Page} page - The Puppeteer Page instance.
 * @param {string} chartSelector - CSS selector for the chart container.
 * @param {number} seriesIndex - Index of the series to fetch data from.
 * @param {number} labelIndex - Index of the label within the series to fetch data for.
 * @returns {Promise<string>} - The data value at the specified series and label index.
 */
async function fetchSeriesData(page: Page, chartSelector: string, seriesIndex: number, labelIndex: number): Promise<string> {
    const seriesSelector = `${chartSelector} .highcharts-series-${seriesIndex} > g.highcharts-data-label > text`;
    const values = await page.$$eval(seriesSelector, (texts: Element[]) => texts.map(text => text.textContent || ''));
    return values[labelIndex] ?? '0'; // Default to '0' if no data found
}

// TODO: Do not throw error when we get message "Labs did not gather this data during the initial testing phase."
// TODO: PowerColor Hellhound AMD Radeon RX 7600 XT 16GB may not scraping properly
// Some GPUs not have all dropdowns available to it
// TODO: detect available games and resolutions and iterate over that Partial<Game> and Partial<Resolution>

/**
 * Parses gaming performance data for a specific GPU model across all games and resolutions.
 * This function checks for data availability and handles cases where data is not gathered.
 * @param {Page} page - The Puppeteer Page instance.
 * @param {string} gpuModel - GPU model for which to fetch performance data.
 * @returns {Promise<GamingPerformanceTestData[]>} - A promise that resolves to an array of performance test data for each game and resolution.
 */
export async function parseGamingPerformance(page: Page, gpuModel: string): Promise<GamingPerformanceTestData[]> {
    const results: GamingPerformanceTestData[] = [];
    const fetchedCombinations = new Set<string>(); // Track fetched game and resolution combinations

    const games: Game[] = Object.keys(Game)
        .filter(key => isNaN(Number(key)))
        .map(key => Game[key as keyof typeof Game]) as Game[];
    const resolutions: Resolution[] = Object.keys(Resolution)
        .filter(key => isNaN(Number(key)))
        .map(key => Resolution[key as keyof typeof Resolution]) as Resolution[];

    const chartLoadStatus = await waitForChartToLoad(page, '#gaming-performance', 1500);
    for (const game of games) {
        for (const resolution of resolutions) {
            const combinationKey = `${game}-${resolution}`;
            if (fetchedCombinations.has(combinationKey)) {
                console.log(`Skipping already fetched combination: ${game} at resolution ${resolution}`);
                continue; // Skip fetching if already done
            }

            try {
                await selectFromDropdown(page, 'game', game);
                await selectFromDropdown(page, 'resolution', resolution);

                const chartLoadStatus = await waitForChartToLoad(page, '#gaming-performance');
                if (chartLoadStatus === 0) { // Chart loaded successfully
                    const data = await fetchChartData(page, '#gaming-performance', 'GeForce RTX 4080 SUPER'); // Make sure to handle dynamic labels
                    results.push({
                        game,
                        resolution,
                        fpsData: data
                    });
                    fetchedCombinations.add(combinationKey); // Mark this combination as fetched
                } else if (chartLoadStatus === 2) {
                    console.log(`Data not available for ${game} at resolution ${resolution} for ${gpuModel}.`);
                }
            } catch (error) {
                console.error(`Error fetching data for ${game} at resolution ${resolution} for ${gpuModel}: ${error}`);
            }
        }
    }
    return results;
}
