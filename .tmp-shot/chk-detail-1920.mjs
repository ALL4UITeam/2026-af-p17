import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })
await page.goto('http://localhost:5173/map-tour-detail.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
const state = await page.evaluate(() => {
  const tour = document.getElementById('legendTour')
  const r = tour.getBoundingClientRect()
  const detail = document.getElementById('tourDetail')?.getBoundingClientRect()
  return {
    hidden: tour.hidden,
    x: Math.round(r.x),
    y: Math.round(r.y),
    w: Math.round(r.width),
    covered: detail && r.left < detail.right && r.right > detail.left && r.top < detail.bottom && r.bottom > detail.top,
  }
})
console.log(JSON.stringify(state))
await page.screenshot({ path: '.tmp-shot/legend-on-detail-1920.png' })
await browser.close()
