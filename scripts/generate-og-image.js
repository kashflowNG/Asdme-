
// Script to generate og-image.png from the HTML template
// Run with: node scripts/generate-og-image.js

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOGImage() {
  console.log('🚀 Starting OG image generation...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport to exact OG image dimensions
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 2 // Higher quality
  });
  
  // Load the HTML file
  const htmlPath = path.join(__dirname, '../client/public/generate-og-image.html');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0'
  });
  
  // Wait for animations to settle
  await page.waitForTimeout(2000);
  
  // Take screenshot of just the container
  const element = await page.$('.og-image-container');
  const outputPath = path.join(__dirname, '../client/public/og-image.png');
  
  await element.screenshot({
    path: outputPath,
    omitBackground: false
  });
  
  await browser.close();
  
  console.log('✅ OG image generated successfully!');
  console.log(`📁 Saved to: ${outputPath}`);
  console.log('📊 Dimensions: 1200×630px');
}

generateOGImage().catch(error => {
  console.error('❌ Error generating OG image:', error);
  process.exit(1);
});
