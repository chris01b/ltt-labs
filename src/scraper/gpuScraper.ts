import puppeteer from 'puppeteer';

interface GPUData {
    name: string;
    detailsUrl: string;
}

const BASE_URL = 'https://www.lttlabs.com/categories/graphics-cards';

/**
 * Launches a Puppeteer browser instance and retrieves the full HTML content of the specified URL.
 * @param url The URL to fetch.
 * @returns The HTML content as a string.
 */
async function fetchHTML(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle0' });
    const content = await page.content();

    await browser.close();
    return content;
}

/**
 * Parses the fetched HTML content and extracts GPU data.
 * @param html The HTML content as a string.
 * @returns An array of GPUData objects.
 */
export async function extractGPUData(html: string): Promise<GPUData[]> {
    const gpuList: GPUData[] = [];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);

    const gpuElements = await page.$$('a[data-testid="article-card"]');
    for (const element of gpuElements) {
        const name = await element.evaluate(el => el.getAttribute('aria-label')?.trim());
        const href = await element.evaluate(el => el.getAttribute('href'));
        const detailsUrl = href ? new URL(href, BASE_URL).href : null;

        if (name && detailsUrl) {
            gpuList.push({ name, detailsUrl });
        }
    }

    await browser.close();
    return gpuList;
}

/**
 * Orchestrates the GPU data scraping process.
 */
async function scrapeGPUs() {
    try {
        const html = await fetchHTML(BASE_URL);
        const gpuData = await extractGPUData(html);
        console.log(gpuData);
    } catch (error) {
        console.error('Scraping failed:', error instanceof Error ? error.message : error);
    }
}

scrapeGPUs();