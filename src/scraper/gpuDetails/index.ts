import { fetchHTML, initializeBrowser } from '../utils';
import { GPUProductDetails } from '../types';
import { parseWhatYouNeedToKnow } from './whatYouNeedToKnow';
import { parseLinks } from './links';
import { parseOverview } from './overview';

/**
 * Fetches and extracts detailed information about GPUs from their respective detail pages.
 * Uses Puppeteer to handle and parse the DOM for specific content sections.
 * 
 * @param url The URL of the GPU details page.
 * @returns An object containing structured GPU product details.
 */
export async function fetchGPUPageDetails(url: string): Promise<GPUProductDetails> {
    const content = await fetchHTML(url);
    const browser = await initializeBrowser();
    const page = await browser.newPage();
    await page.setContent(content);

    const [whatYouNeedToKnow, links, overview] = await Promise.all([
        parseWhatYouNeedToKnow(page),
        parseLinks(page),
        parseOverview(page)
    ]);

    await browser.close();

    return {
        overview: overview,
        goodPoints: whatYouNeedToKnow.goodPoints,
        badPoints: whatYouNeedToKnow.badPoints,
        otherPoints: whatYouNeedToKnow.otherPoints,
        links: links,
        hardwareSummary: "",
        inTheBox: { images: [], items: [] },
        graphicsProcessorSpecs: {},
        coresAndClocks: {},
        boardDesignSpecs: {},
        featuresAndSoftware: {
            summary: "",
            supportedFeatures: {},
            encodeDecode: {},
            oemTechnologies: [],
        },
        performance: {
            summary: "",
            gamingPerformance: {},
            rayTracingPerformance: {},
        },
        productivityAndEfficiency: {
            productivityTasks: {},
            syntheticScores: {},
        },
        testConfiguration: {
            summary: "",
            testBench: {},
            testedSettings: "",
        }
    };
}
