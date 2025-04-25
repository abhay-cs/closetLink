// lib/scraper.ts
import * as cheerio from 'cheerio';

export async function scrapeProductInfo(url: string) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0', // mimic a browser
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch URL');
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Try Open Graph meta tags first
    const image = $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content');
    const title = $('meta[property="og:title"]').attr('content') ||
        $('title').text() ||
        "No title Available";
    const price =
        $('meta[property="product:price:amount"]').attr('content') ||
        $('[itemprop="price"]').attr('content') ||
        $('[class*="price"]').first().text() ||
        "No price available!";

    return {
        url,
        image: image || null,
        title: title?.trim() || null,
        price: price?.trim() || null,
    };
}