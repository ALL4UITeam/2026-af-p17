import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
const field = await page.$('.panel__field')
await field.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/search-panel.png' })
const box = await page.$eval('.panel__search-btn', (el) => {
  const r = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  const field = el.closest('.panel__field').getBoundingClientRect()
  return {
    btnR: cs.borderRadius,
    btnH: Math.round(r.height),
    fieldH: Math.round(field.height),
    rightGap: Math.round(field.right - r.right),
    topGap: Math.round(r.top - field.top),
  }
})
console.log('panel', box)

await page.goto('http://localhost:5173/map-tour.html', { waitUntil: 'networkidle0' })
const tour = await page.$('.tour__search')
await tour.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/search-tour.png' })
const tbox = await page.$eval('.tour__search .panel__search-btn', (el) => {
  const r = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  const wrap = el.closest('.tour__search').getBoundingClientRect()
  return {
    btnR: cs.borderRadius,
    btnH: Math.round(r.height),
    wrapH: Math.round(wrap.height),
    rightGap: Math.round(wrap.right - r.right),
    topGap: Math.round(r.top - wrap.top),
  }
})
console.log('tour', tbox)
await browser.close()
