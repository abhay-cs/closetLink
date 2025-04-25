// app/api/scraper/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scrapeProductInfo } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
  }

  try {
    const data = await scrapeProductInfo(url);
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to scrape' }, { status: 500 });
  }
}