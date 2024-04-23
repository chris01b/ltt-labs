import puppeteer from 'puppeteer';
import { fetchHTML } from './utils';
import { GPUProductDetails } from './types';

async function scrapeDetailedGPUData() {
    const gpuUrls = ['https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb']; // Replace with URLs from gpuScraper
    
    for (const url of gpuUrls) {
        const details = await fetchHTML(url);
        console.log(details);
    }
}

scrapeDetailedGPUData();