import { Page } from 'puppeteer';
import { expandSection } from '../utils';
import { TestConfiguration } from '../types';

/**
 * Extracts the test configuration from the specified webpage after simulating a button click
 * that reveals the test configuration data.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The testConfiguration data if found, otherwise returns null.
 */
export async function parseTestConfiguration(page: Page): Promise<TestConfiguration> {
    let testConfiguration: TestConfiguration = {
        summary: null,
        testBench: null,
        testedSettings: null
    }
    
    try {
        const buttonSelector = '#test-configuration > div > button';
        const isOpenSelector = '#test-configuration';

        const testConfigurationSectionName = "Test Configuration";
        const result = await expandSection(page, buttonSelector, isOpenSelector, testConfigurationSectionName);

        // const [] = await Promise.all([]);

        return testConfiguration = {
            ...testConfiguration
        };
    } catch (error) {
        console.error(`Error fetching test configuration summary: ${error}`);
        return testConfiguration;
    }
}
