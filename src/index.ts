import { scrapeGPUs } from './scraper/gpuScraper';
import { fetchGPUPageDetails } from './scraper';

async function fetchAllGPUData() {
    try {
        const gpuList = await scrapeGPUs();  // Fetch all GPU data including URLs.
        const detailsPromises = gpuList.map(gpu => fetchGPUPageDetails(gpu.url));
        const details = await Promise.all(detailsPromises);  // Fetch details for each GPU concurrently.

        console.log(details);
    } catch (error) {
        console.error('Failed to fetch GPU details:', error instanceof Error ? error.message : error);
    }
}

fetchAllGPUData();
