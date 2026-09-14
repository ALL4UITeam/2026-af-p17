import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

await page.goto('http://localhost:5173/map-tour.html', { waitUntil: 'networkidle0' })
const list = await page.evaluate(() => {
  const el = document.getElementById('tourList')
  const r = el.getBoundingClientRect()
  return {
    hidden: el.hidden,
    title: el.querySelector('.tour__title')?.textContent,
    sub: el.querySelector('.tour__sub-tit')?.textContent,
    count: el.querySelector('[data-bind="tour-count"]')?.textContent,
    cards: el.querySelectorAll('.tour__card').length,
    on: el.querySelector('.tour__card.is-on .tour__name')?.textContent,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
  }
})
console.log('list', JSON.stringify(list, null, 2))
const listEl = await page.$('#tourList')
await listEl.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/tour-list-now.png' })

await page.goto('http://localhost:5173/map-tour-overlay.html', { waitUntil: 'networkidle0' })
const over = await page.evaluate(() => {
  const overlay = document.getElementById('tourOverlay')
  const poi = document.getElementById('poiPop')
  const pr = poi.getBoundingClientRect()
  const or_ = overlay.getBoundingClientRect()
  return {
    overlayHidden: overlay.hidden,
    poiHidden: poi.hidden,
    poiTitle: poi.querySelector('[data-bind="poi-title"]')?.textContent,
    poiCat: poi.querySelector('[data-bind="poi-cat"]')?.textContent,
    overlayRect: { x: Math.round(or_.x), y: Math.round(or_.y), w: Math.round(or_.width) },
    poiRect: { x: Math.round(pr.x), y: Math.round(pr.y), w: Math.round(pr.width), h: Math.round(pr.height) },
  }
})
console.log('overlay', JSON.stringify(over, null, 2))
await page.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/tour-over-poi.png' })

await page.goto('http://localhost:5173/map-tour-detail.html', { waitUntil: 'networkidle0' })
const detail = await page.evaluate(() => {
  const list = document.getElementById('tourList')
  const d = document.getElementById('tourDetail')
  return {
    listHidden: list.hidden,
    detailHidden: d.hidden,
    listX: Math.round(list.getBoundingClientRect().x),
    detailX: Math.round(d.getBoundingClientRect().x),
  }
})
console.log('detail', JSON.stringify(detail, null, 2))
await page.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/tour-detail-list.png' })

await browser.close()
