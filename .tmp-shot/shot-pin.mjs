import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/guide.html#pin', { waitUntil: 'networkidle0' })
await page.$eval('#pin', (el) => el.scrollIntoView({ block: 'start' }))
await new Promise((r) => setTimeout(r, 300))
const el = await page.$('#pin')
await el.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/guide-pin.png' })
await browser.close()
