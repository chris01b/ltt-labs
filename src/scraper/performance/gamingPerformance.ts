import { Page } from 'puppeteer';
import { GamingPerformanceTestData, DataPoint, Game, Resolution } from '../types/gamingPerformance';

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
 * Scrolls to the element specified by the selector.
 * @param {Page} page - The Puppeteer Page instance.
 * @param {string} selector - CSS selector of the element to scroll into view.
 * @returns {Promise<void>}
 */
async function scrollToElement(page: Page, selector: string): Promise<void> {
    const element = await page.$(selector);
    if (!element) {
        throw new Error(`Element with selector ${selector} not found or is not visible.`);
    }
    await page.evaluate(el => el.scrollIntoView(), element);
}

/**
 * Waits for a chart to load by attempting to scroll to the chart and find a specific element within it, up to a maximum number of attempts.
 * @param {Page} page - The Puppeteer Page instance.
 * @param {string} chartSelector - CSS selector for the chart container.
 * @param {number} maxAttempts - Maximum number of attempts to try loading the chart (default is 10).
 * @returns {Promise<void>}
 */
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

type DropdownType = 'game' | 'resolution';

/**
 * Selects an item from a dropdown within the gaming performance section on the page. 
 * It handles both game and resolution dropdowns based on the specified type.
 * 
 * @param {Page} page - The Puppeteer Page object representing the browser page.
 * @param {DropdownType} dropdownType - Specifies the type of dropdown to interact with. Can be either 'game' or 'resolution'.
 * @param {Game | Resolution} selection - The item to select from the dropdown, which can be either a game or a resolution.
 * @throws {Error} Throws an error if the specified dropdown button or the desired selection is not found.
 * 
 * This function clicks on the specified dropdown button within the #gaming-performance section,
 * waits for the dropdown menu to become visible, and then selects the specified item.
 * The function utilizes indices to determine which dropdown button to click: '0' for games and '1' for resolutions.
 */
async function selectFromDropdown(page: Page, dropdownType: DropdownType, selection: Game | Resolution): Promise<void> {
    // Define the base selector for dropdown buttons within the gaming-performance section
    const dropdownSelector = '#gaming-performance [id^="headlessui-popover-button-"]';
    const dropdownButtons = await page.$$(dropdownSelector);

    // Determine the index based on dropdownType
    const index = dropdownType === 'game' ? 0 : 1;

    // Check if the button at the desired index exists and click it
    if (dropdownButtons.length > index) {
        await dropdownButtons[index].click();
    } else {
        throw new Error(`${dropdownType} dropdown button not found.`);
    }

    // Wait for the corresponding dropdown panel to become visible
    const dropdownPanelSelector = `#gaming-performance [id^="headlessui-popover-panel-"]`;
    await page.waitForSelector(dropdownPanelSelector, { visible: true });

    // Click the button with the specific game or resolution name within the dropdown panel
    const itemSelector = `${dropdownPanelSelector} button[type="button"]`;
    await page.$$eval(itemSelector, (buttons, selection) => {
        const selectedItemButton = buttons.find(button => button.textContent?.trim() === selection);
        if (selectedItemButton) {
            selectedItemButton.click();
        } else {
            throw new Error(`Selection '${selection}' not found in dropdown.`);
        }
    }, selection.toString());
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

export async function parseGamingPerformance(page: Page, gpuModel: string, gameName: Game): Promise<GamingPerformanceTestData[]> {
    try {
        await waitForChartToLoad(page, '#gaming-performance');
        await selectFromDropdown(page, 'resolution', Resolution.R1080);
        const data = await fetchChartData(page, '#gaming-performance', gpuModel);
        return [{
            game: gameName,  // Selected game
            resolution: Resolution.R1080,  // Default resolution
            fpsData: data
        }];
    } catch (error) {
        console.error(`Error fetching gaming performance for ${gpuModel}: ${error}`);
        throw error; // Re-throw to handle or log appropriately outside this function
    }
}
