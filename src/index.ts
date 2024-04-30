import * as fs from 'fs';
import { scrapeGpuList } from './scraper/gpuListScraper';
import { fetchGPUPageDetails } from './scraper';
import { GPUProductDetails } from './scraper/types';

/**
 * Writes an array of GPUProductDetails to a JSON file.
 * @param {GPUProductDetails[]} data - The data to write to the file.
 * @param {string} filename - The name of the file to create.
 */
function writeGPUProductDetailsToFile(data: GPUProductDetails[], filename: string): void {
    // Convert the data to a JSON string with indentation for readability
    const jsonData = JSON.stringify(data, null, 2);

    // Write data to file
    fs.writeFile(filename, jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Failed to write to file:', err);
        } else {
            console.log(`Data successfully written to ${filename}`);
        }
    });
}

async function fetchAllGPUData() {
    try {
        const gpuList = await scrapeGpuList();  // Fetch list of GPUs
        const detailsPromises = gpuList.map(gpu => fetchGPUPageDetails(gpu.url));
        const details = await Promise.all(detailsPromises);  // Fetch details for each GPU concurrently.

        // console.log(util.inspect(details, {showHidden: false, depth: null, colors: true}));

        writeGPUProductDetailsToFile(details, 'output.json');
    } catch (error) {
        console.error('Failed to fetch GPU details:', error instanceof Error ? error.message : error);
    }
}

fetchAllGPUData();
