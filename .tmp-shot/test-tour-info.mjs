import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
await page.goto('http://localhost:5173/map.html#tour', { waitUntil: 'networkidle0' })
await page.$eval('[data-action="info-layer"][data-layer-id="LYR_TOUR"]', (el) => el.click())
const info = await page.evaluate(() => ({
  overlay: !document.getElementById('tourOverlay')?.hidden,
  meta: document.getElementById('metaModal')?.hidden,
}))
console.log('TOUR_INFO', JSON.stringify(info))
await browser.close()
