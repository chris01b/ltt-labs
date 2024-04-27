import { scrapeGpuList } from './scraper/gpuListScraper';
import { fetchGPUPageDetails } from './scraper';

async function fetchAllGPUData() {
    try {
        const gpuList = await scrapeGpuList();  // Fetch list of GPUs
        const detailsPromises = gpuList.map(gpu => fetchGPUPageDetails(gpu.url));
        const details = await Promise.all(detailsPromises);  // Fetch details for each GPU concurrently.

        console.log(details);
    } catch (error) {
        console.error('Failed to fetch GPU details:', error instanceof Error ? error.message : error);
    }
}

fetchAllGPUData();
