import { Page } from 'puppeteer';
import { waitForChartToLoad } from '../utils/charts';
import { NonGameReport, ComponentMeasurement } from '../types/nonGameReport';

/**
 * Filters out the non-reference components from each NonGameReport object.
 * 
 * @param jsonData The NonGameReport data retrieved from the API.
 * @returns An array of NonGameReport objects, each containing only reference components.
 */
export function parseProductivityAndEfficiencyData(jsonData: NonGameReport): NonGameReport[] {
    // Filter the componentMeasurements to only include those where isReferenceComponent is true
    const filteredComponentMeasurements: ComponentMeasurement[] = jsonData.componentMeasurements.filter(component => component.isReferenceComponent);

    // If there are no reference components, we should not include this report
    if (filteredComponentMeasurements.length === 0) {
        return [];
    }

    // Create a new NonGameReport object with only the filtered components
    const filteredReport: NonGameReport = {
        ...jsonData, // Spread the original data to retain other properties
        componentMeasurements: filteredComponentMeasurements // Overwrite the componentMeasurements with only the filtered ones
    };

    // Return the new NonGameReport object in an array
    return [filteredReport];
}

/**
 * Fetches and parses productivity and efficiency data from the API, filtering out non-reference components.
 * This function assumes that data loading flags have been set in the browser environment.
 *
 * @param {Page} page - The Puppeteer Page instance used to intercept requests.
 * @returns {Promise<[NonGameReport[], NonGameReport[]]>} A tuple containing arrays of productivity and synthetic data for reference components.
 */
export async function getProductivityAndEfficiencyData(page: Page): Promise<[NonGameReport[], NonGameReport[]]> {
    try {
        await waitForChartToLoad(page, '#productivity', 1500);
        const rawProductivityTaskData = await page.evaluate(() => {
            return window.productivityTaskData ? JSON.stringify(window.productivityTaskData) : null;
        });

        await waitForChartToLoad(page, '#synthetics', 1500);
        const rawSyntheticScoreData = await page.evaluate(() => {
            return window.syntheticScoreData ? JSON.stringify(window.syntheticScoreData) : null;
        });

        // Parse the data in the Node.js context
        const productivity = rawProductivityTaskData ? parseProductivityAndEfficiencyData(JSON.parse(rawProductivityTaskData)) : [];
        const synthetics = rawSyntheticScoreData ? parseProductivityAndEfficiencyData(JSON.parse(rawSyntheticScoreData)) : [];

        if (productivity.length === 0 || synthetics.length === 0) {
            throw new Error("Parsed productivity & efficiency data is incomplete or incorrect.");
        }

        return [productivity, synthetics];
    } catch (error) {
        console.error(`Error fetching or productivity & efficiency data: ${error}`);
        throw new Error(`Productivity & Efficiency data processing failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
}
