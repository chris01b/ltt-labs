import { initializePage } from './utils';
import { GPUData } from './types';

/**
 * Retrieves a list of GPUs from the LTT Labs list.
 * @param {string} html - The HTML content as a string.
 * @returns {Promise<GPUData[]>} An array of GPUData objects.
*/
export async function scrapeGpuList(): Promise<GPUData[]> {
    const gpuListUrl = 'https://www.lttlabs.com/categories/graphics-cards';
    // Initialize browser and page for scraping
    const { browser, page } = await initializePage();
    const response = await page.goto(gpuListUrl, { waitUntil: 'networkidle2' });

    // Check for valid response
    if (!response) {
        await browser.close();
        throw new Error('No response from the server.');
    }
    if (response?.status() >= 400) {
        await browser.close();
        throw new Error(`Received a ${response.status()} error from the server.`);
    }

    const gpuElements = await page.$$('[data-testid="article-card"]');
    const gpuList: GPUData[] = [];

    // Extract GPU data from page elements
    for (const element of gpuElements) {
        const name = await element.evaluate(el => el.getAttribute('aria-label')?.trim());
        const href = await element.evaluate(el => el.getAttribute('href'));
        const url = href ? new URL(href, gpuListUrl).href : null;
        if (name && url) {
            gpuList.push({ name, url });
        }
    }

    // Clean up
    await browser.close();
    return gpuList;
}