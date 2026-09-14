import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
await page.goto('http://localhost:5173/map-legend-tour.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
const el = await page.$('#legendTour')
console.log(await el.boundingBox())
const styles = await page.evaluate(() => {
  const t = document.getElementById('legendTour')
  const cs = getComputedStyle(t)
  const items = [...t.querySelectorAll('.legend__item')].map((node) => {
    const r = node.getBoundingClientRect()
    return { t: node.textContent.trim(), y: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) }
  })
  return { overflow: cs.overflow, h: cs.height, items }
})
console.log(JSON.stringify(styles, null, 2))
await el.screenshot({ path: '.tmp-shot/legend-tour-crop.png' })
await browser.close()
