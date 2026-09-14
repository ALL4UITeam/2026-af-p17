import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
await page.goto('http://localhost:5173/map.html#tour', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 300))
const hash = await page.evaluate(() => ({
  hash: location.hash,
  theme: document.getElementById('kids-theme')?.classList.contains('is-open'),
  cats: document.querySelectorAll('#leaves-tour .tree__leaf').length,
}))
console.log('hash', JSON.stringify(hash))
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
await page.click('[data-action="open-tour"]')
await new Promise((r) => setTimeout(r, 200))
const gnb = await page.evaluate(() => document.getElementById('kids-theme')?.classList.contains('is-open'))
console.log('gnb tour', gnb)
await browser.close()
