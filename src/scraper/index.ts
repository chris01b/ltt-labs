import { initializePage } from './utils';
import { GPUProductDetails } from './types';
import { parseWhatYouNeedToKnow } from './gpuDetails/whatYouNeedToKnow';
import { parseLinks } from './gpuDetails/links';
import { parseOverview } from './gpuDetails/overview';
import { parseArticleInfo } from './gpuDetails/articleInfo';
import { parseHardware } from './hardware';
import { parseFeaturesAndSoftware } from './featuresAndSoftware';
import { parsePerformance } from './performance';
import { parseTestConfiguration } from './testConfiguration';

/**
 * Fetches and extracts detailed information about GPUs from their respective detail pages.
 * Uses Puppeteer to handle and parse the DOM for specific content sections.
 * 
 * @param url The URL of the GPU details page.
 * @returns An object containing structured GPU product details.
 */
export async function fetchGPUPageDetails(url: string): Promise<GPUProductDetails> {
    const { browser, page } = await initializePage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const [whatYouNeedToKnow, links, overview, articleInfo, hardware, featuresAndSoftware, performance, testConfiguration] = await Promise.all([
        parseWhatYouNeedToKnow(page),
        parseLinks(page),
        parseOverview(page),
        parseArticleInfo(page),
        parseHardware(page),
        parseFeaturesAndSoftware(page),
        parsePerformance(browser, page),
        parseTestConfiguration(page)
    ]);

    await browser.close();

    return {
        name: articleInfo.title,
        author: articleInfo.author,
        testedBy: articleInfo.testedBy,
        published: articleInfo.published,
        overview: overview,
        goodPoints: whatYouNeedToKnow.goodPoints,
        badPoints: whatYouNeedToKnow.badPoints,
        otherPoints: whatYouNeedToKnow.otherPoints,
        links: links,
        hardware: hardware,
        featuresAndSoftware: featuresAndSoftware,
        performance: performance,
        productivityAndEfficiency: null,
        testConfiguration: testConfiguration
    };
}
