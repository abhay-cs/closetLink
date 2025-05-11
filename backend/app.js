const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { JSDOM } = require('jsdom');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    const title = doc.querySelector('meta[property="og:title"]')?.content || doc.title || 'dad';
    console.log(title);
    
    const image = doc.querySelector('meta[property="og:image"]')?.content || '';
    const price = doc.querySelector('meta[property="product:price:amount"]')?.content || '';

    
    res.json({ title, image, price });
  } catch (err) {
    res.status(500).json({ error: 'Scrape failed', detail: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));