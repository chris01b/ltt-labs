import { Page } from 'puppeteer';
import { getSpecsObject } from '../utils';
import { TestBench } from '../types';

/**
 * Extracts the test bench setup from the specified webpage with the test configuration box open
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The test bench setup data.
 */
export async function parseTestBench(page: Page): Promise<TestBench | null> {
    try {
        const testBenchSelector = '#test-bench';
        const sectionExists = await page.$(testBenchSelector) !== null;
        if (!sectionExists) {
            console.log("Test bench section not found.");
            return null;
        }
        
        const specsSelector = `${testBenchSelector} div.group.text-sm`;
        const specs = await getSpecsObject(page, specsSelector, true);
        
        return specs;
    } catch (error) {
        console.error(`Error fetching test bench setup: ${error}`);
        return null;
    }
}
