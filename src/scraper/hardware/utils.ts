export async function getImagesData(selector: string): Promise<{
    url: string | null;
    caption: string | null;
}[]> {
    const imagesSelector = `${selector} div[class*="MetadataSection_asset"] ul.slider`;
    return await page.$$eval(`${imagesSelector} li:not(:first-child):not(:last-child)`, lis => lis.map(li => ({
        url: li.querySelector('img')?.src || null,
        caption: li.querySelector('span')?.textContent?.trim() || null
    })));
}