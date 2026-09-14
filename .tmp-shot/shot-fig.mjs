import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

await page.goto('http://localhost:5173/map-lyr.html', { waitUntil: 'networkidle0' })
const lyr = await page.evaluate(() => {
  const el = document.querySelector('.lyr-list')
  const r = el.getBoundingClientRect()
  return {
    hidden: el.hidden,
    display: getComputedStyle(el).display,
    open: el.classList.contains('is-open'),
    x: Math.round(r.x),
    y: Math.round(r.y),
    w: Math.round(r.width),
    h: Math.round(r.height),
  }
})
console.log('lyr', lyr)
await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/fig-map-lyr.png',
})

await page.goto('http://localhost:5173/map-basemap.html', { waitUntil: 'networkidle0' })
const bmap = await page.evaluate(() => {
  const el = document.querySelector('.bmap')
  const r = el.getBoundingClientRect()
  return {
    hidden: el.hidden,
    display: getComputedStyle(el).display,
    x: Math.round(r.x),
    y: Math.round(r.y),
    w: Math.round(r.width),
    h: Math.round(r.height),
  }
})
console.log('bmap', bmap)
await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/fig-map-basemap.png',
})
await browser.close()
