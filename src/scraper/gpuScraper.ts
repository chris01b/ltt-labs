import { fetchHTML, initializePage } from './utils';
import { GPUData } from './types';

const BASE_URL = 'https://www.lttlabs.com/categories/graphics-cards';

/**
 * Parses the fetched HTML content and extracts GPU data.
 * @param html The HTML content as a string.
 * @returns An array of GPUData objects.
 */
export async function extractGPUData(html: string): Promise<GPUData[]> {
    // TODO: Use common modules
    const { browser, page } = await initializePage();
    await page.setContent(html);
    const gpuElements = await page.$$('a[data-testid="article-card"]');
    const gpuList: GPUData[] = [];
    for (const element of gpuElements) {
        const name = await element.evaluate(el => el.getAttribute('aria-label')?.trim());
        const href = await element.evaluate(el => el.getAttribute('href'));
        const url = href ? new URL(href, BASE_URL).href : null;
        if (name && url) {
            gpuList.push({ name, url });
        }
    }
    await browser.close();
    return gpuList;
}

/**
 * Orchestrates the GPU data scraping process.
 */
export async function scrapeGPUs() {
    const html = await fetchHTML(BASE_URL);
    return extractGPUData(html);
}