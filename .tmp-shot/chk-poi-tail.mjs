import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 })
await page.setCacheEnabled(false)
await page.goto('http://localhost:5173/map-poi.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
const info = await page.evaluate(() => {
  const pop = document.getElementById('poiPop')
  const tail = pop?.querySelector('.poi__tail')
  const pin = document.getElementById('poiStagePin')
  const ts = getComputedStyle(tail)
  const ps = getComputedStyle(pin)
  const pr = pop.getBoundingClientRect()
  const tr = tail.getBoundingClientRect()
  const ir = pin.getBoundingClientRect()
  return {
    tail: { w: ts.width, h: ts.height, bg: ts.backgroundImage, display: ts.display, rect: { t: Math.round(tr.top), l: Math.round(tr.left), w: Math.round(tr.width), h: Math.round(tr.height) } },
    pin: { display: ps.display, rect: { t: Math.round(ir.top), l: Math.round(ir.left), w: Math.round(ir.width), h: Math.round(ir.height) } },
    pop: { t: Math.round(pr.top), b: Math.round(pr.bottom), l: Math.round(pr.left), w: Math.round(pr.width), h: Math.round(pr.height) },
  }
})
console.log(JSON.stringify(info, null, 2))
const popEl = await page.$('#poiPop')
await popEl.screenshot({ path: '.tmp-shot/poi-el.png' })
await page.goto('http://localhost:5173/map-poi-list.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 300))
const listEl = await page.$('#poiListPop')
await listEl.screenshot({ path: '.tmp-shot/poi-list-el.png' })
await browser.close()
