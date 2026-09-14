import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
const css = await page.$eval('.panel__list', (el) => {
  const s = getComputedStyle(el)
  return {
    overflow: s.overflow,
    scrollbarWidth: s.scrollbarWidth,
    overscroll: s.overscrollBehavior,
  }
})
console.log(css)
await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/panel-scroll.png',
  clip: { x: 80, y: 140, width: 380, height: 560 },
})
await browser.close()
