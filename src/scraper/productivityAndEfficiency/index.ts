import { Page } from 'puppeteer';
import { expandSection } from '../utils';
import { getProductivityAndEfficiencyData } from './productivityAndEfficiencyData';
import { extractSessionIds } from '../utils/charts';
import { ProductivityAndEfficiency } from '../types';
import { NonGameReport } from '../types/nonGameReport';

export async function parseProductivityAndEfficiency(page: Page): Promise<ProductivityAndEfficiency> {
    let productivityAndEfficiency: ProductivityAndEfficiency = {
        productivityTasks: null,
        syntheticScores: null
    };

    try {
        // Enable request interception to handle responses dynamically
        await page.setRequestInterception(true);

        // Extract session IDs for each section
        const sessionIdsMap = await extractSessionIds(page, ["Productivity", "Synthetics"], "productivity-and-efficiency");
        console.log('Session IDs:', sessionIdsMap);

        page.on('request', interceptedRequest => {
            interceptedRequest.continue();
        });

        page.on('response', async response => {
            const url = response.url();
            for (const [key, ids] of sessionIdsMap) {
                ids.forEach(async id => {
                    if (url === `https://www.lttlabs.com/api/chart/data/gpu/nonGameReport/${id}`) {
                        console.log('Response received for:', key, id);
                        const jsonData: NonGameReport = await response.json();
                        await page.evaluate((key, data) => {
                            window[key] = window[key] || [];
                            window[key].push(data);
                        }, key, jsonData);
                        console.log('Response evaluated')
                    }
                });
            }
        });

        await expandSection(page, '#productivity-and-efficiency > div > button:not([aria-label])', '#productivity-efficiency-summary', "Productivity & Efficiency", true);

        // Wait for data to be loaded into the browser context
        await page.waitForFunction((sessionIdsMap) => {
            const allKeysLoadedCorrectly = Object.entries(sessionIdsMap).every(([key, ids]) => {
                return window[key] && window[key].length === ids.length; // Check both existence and length
            });
            return allKeysLoadedCorrectly;
        }, {}, sessionIdsMap);

        // Fetch and parse the data after section expansion
        productivityAndEfficiency = await getProductivityAndEfficiencyData(page, sessionIdsMap);

        return productivityAndEfficiency;
    } catch (error) {
        console.error(`Error during productivity & efficiency parsing and aggregation: ${error}`);
        return productivityAndEfficiency;  // Return the partially parsed data, if any
    } finally {
        await page.setRequestInterception(false);
    }
}
