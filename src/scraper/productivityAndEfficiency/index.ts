import { Page } from 'puppeteer';
import { expandSection } from '../utils';
import { getProductivityAndEfficiencyData } from './productivityAndEfficiencyData';
import { extractSessionId } from '../utils/charts';
import { ProductivityAndEfficiency } from '../types';
import { NonGameReport } from '../types/nonGameReport';

export async function parseProductivityAndEfficiency(page: Page): Promise<ProductivityAndEfficiency> {
    let productivtyAndEfficiency: ProductivityAndEfficiency = {
        productivityTasks: null,
        syntheticScores: null
    };

    try {
        // Enable request interception before expanding sections
        await page.setRequestInterception(true);

        const productivitySessionId = await extractSessionId(page, "Productivity", "productivity-and-efficiency");
        const syntheticsSessionId = await extractSessionId(page, "Synthetics", "productivity-and-efficiency");

        page.on('request', interceptedRequest => {
            interceptedRequest.continue();
        });

        // Set up response handling
        page.on('response', async response => {
            const url = response.url();

            // Store the JSON directly in the browser context when the response arrives
            if (url === `https://www.lttlabs.com/api/chart/data/gpu/nonGameReport/${productivitySessionId}`) {
                console.log('productivitySessionId response')
                const jsonData = await response.json();
                await page.evaluate((data) => {
                    window.productivityTaskData = data;
                }, jsonData);
            } else if (url === `https://www.lttlabs.com/api/chart/data/gpu/nonGameReport/${syntheticsSessionId}`) {
                console.log('syntheticsSessionId response')
                const jsonData = await response.json();
                await page.evaluate((data) => {
                    window.syntheticScoreData = data;
                }, jsonData);
            }
        });

        await expandSection(page, '#productivity-and-efficiency > div > button:not([aria-label])', '#productivity-efficiency-summary', "Productivity & Efficiency", true);

        // Wait for both data sets to be loaded
        await page.waitForFunction(() => {
            return window.productivityTaskData && window.syntheticScoreData;
        });

        // Fetch and parse productivity & efficiency data after section expansion
        const [productivityTasks, syntheticScores] = await getProductivityAndEfficiencyData(page);
        productivtyAndEfficiency.productivityTasks = productivityTasks;
        productivtyAndEfficiency.syntheticScores = syntheticScores;

        // Validate data to ensure all required parts are parsed correctly
        if (!productivityTasks || !syntheticScores) {
            throw new Error("Failed to parse all productivity & efficiency components successfully.");
        }

        return productivtyAndEfficiency;
    } catch (error) {
        console.error(`Error during productivity & efficiency parsing and aggregation: ${error}`);
        return productivtyAndEfficiency;  // Return the partially parsed productivity & efficiency data, if any
    } finally {
        // Disable request interception after processing is complete
        await page.setRequestInterception(false);
    }
}
