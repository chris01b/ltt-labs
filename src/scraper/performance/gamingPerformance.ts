import { Page } from 'puppeteer';
import { GamingPerformanceTestData, DataPoint, Game, Resolution } from '../types/gamingPerformance';

function logChartData(labelToFind: string, data: string[], legendLabels: string[]): void {
    const output = data.map((value, idx) => `${legendLabels[idx] || `Series ${idx}`}: ${value}`).join(', ');
    console.log(`Data for ${labelToFind}: ${output}`);
}

async function scrollToElement(page: Page, selector: string): Promise<void> {
    const element = await page.$(selector);
    if (!element) {
        throw new Error(`Element with selector ${selector} not found or is not visible.`);
    }
    await page.evaluate(el => el.scrollIntoView(), element);
}

async function waitForChartToLoad(page: Page, chartSelector: string, maxAttempts = 10): Promise<void> {
    const selector = `${chartSelector} .highcharts-series-0 > g.highcharts-data-label > text`;
    let attempts = 0;
    while (attempts < maxAttempts) {
        await scrollToElement(page, chartSelector);
        try {
            await page.waitForSelector(selector, { visible: true, timeout: 1500 });
            return; // If the selector is found and visible, exit the function
        } catch (error) {
            attempts++;
            if (attempts === maxAttempts) {
                throw new Error(`Chart not found or is not visible after ${maxAttempts} attempts: ${error}`);
            }
        }
    }
}

async function fetchChartData(page: Page, chartSelector: string, labelToFind: string): Promise<DataPoint> {
    const labelsSelector = `${chartSelector} .highcharts-xaxis-labels span`;
    const labels = await page.$$eval(labelsSelector, (spans: Element[]) => spans.map(span => span.textContent?.trim() || ''));
    const labelIndex = labels.findIndex((label: string) => label === labelToFind);

    if (labelIndex === -1) {
        throw new Error('Label not found');
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

async function fetchSeriesData(page: Page, chartSelector: string, seriesIndex: number, labelIndex: number): Promise<string> {
    const seriesSelector = `${chartSelector} .highcharts-series-${seriesIndex} > g.highcharts-data-label > text`;
    const values = await page.$$eval(seriesSelector, (texts: Element[]) => texts.map(text => text.textContent || ''));
    return values[labelIndex] ?? '0'; // Default to '0' if no data found
}

export async function parseGamingPerformance(page: Page, gpuModel: string): Promise<GamingPerformanceTestData[]> {
    try {
        await waitForChartToLoad(page, '#gaming-performance');
        const data = await fetchChartData(page, '#gaming-performance', gpuModel);
        return [{
            game: Game.Overall,  // Default game
            resolution: Resolution.R1080,  // Default resolution (but only for some pages!)
            fpsData: data
        }];
    } catch (error) {
        console.error(`Error fetching gaming performance for ${gpuModel}: ${error}`);
        throw error; // Re-throw to handle or log appropriately outside this function
    }
}
