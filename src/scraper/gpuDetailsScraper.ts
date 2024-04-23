import { fetchHTML, initializeBrowser } from './utils';
import { GPUProductDetails } from './types';

/**
 * Fetches and extracts detailed information about GPUs from their respective detail pages.
 * Uses Puppeteer to handle and parse the DOM for specific content sections.
 * 
 * @param url The URL of the GPU details page.
 * @returns An object containing structured GPU product details.
 */
async function fetchGPUPageDetails(url: string): Promise<GPUProductDetails> {
    const content = await fetchHTML(url);
    const browser = await initializeBrowser();
    const page = await browser.newPage();
    await page.setContent(content);

    const whatYouNeedToKnow = await page.evaluate(() => {
        const details: Partial<GPUProductDetails> = {
            goodPoints: [],
            badPoints: [],
            otherPoints: []
        };

        const goodIcon = document.querySelector("div.flex.h-5.w-5.items-center.justify-center.rounded-full.bg-green-500");
        const badIcon = document.querySelector("div.flex.h-5.w-5.items-center.justify-center.rounded-full.bg-red-500");
        const restIcon = document.querySelector("div.flex.h-5.w-5.items-center.justify-center.rounded-full.bg-neutral-400");

        const goodContainer = goodIcon ? goodIcon.parentNode?.parentNode as HTMLElement : null;
        const badContainer = badIcon ? badIcon.parentNode?.parentNode as HTMLElement : null;
        const restContainer = restIcon ? restIcon.parentNode?.parentNode as HTMLElement : null;

        if (goodContainer) {
            details.goodPoints = Array.from(goodContainer.querySelectorAll('ul li')).map(li => {
                const title = li.querySelector('span')?.textContent?.trim();
                const description = li.querySelector('p')?.textContent?.trim();
                return `${title}: ${description}`;
            });
        }

        if (badContainer) {
            details.badPoints = Array.from(badContainer.querySelectorAll('ul li')).map(li => {
                const title = li.querySelector('span')?.textContent?.trim();
                const description = li.querySelector('p')?.textContent?.trim();
                return `${title}: ${description}`;
            });
        }

        if (restContainer) {
            details.otherPoints = Array.from(restContainer.querySelectorAll('ul li')).map(li => {
                const title = li.querySelector('span')?.textContent?.trim();
                const description = li.querySelector('p')?.textContent?.trim();
                return `${title}: ${description}`;
            });
        }

        return details;
    });

    await browser.close();

    return {
        overview: "",
        goodPoints: whatYouNeedToKnow.goodPoints,
        badPoints: whatYouNeedToKnow.badPoints,
        otherPoints: whatYouNeedToKnow.otherPoints,
        links: [],
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

/**
 * Orchestrates the GPU data scraping process from detailed pages.
 */
async function scrapeDetailedGPUData() {
    const gpuUrls = ['https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb']; // Replace with dynamic URLs from gpuScraper
    
    for (const url of gpuUrls) {
        const details = await fetchGPUPageDetails(url);
        console.log(details);
    }
}

scrapeDetailedGPUData();
