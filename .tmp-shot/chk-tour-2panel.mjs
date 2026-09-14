import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })
await page.goto('http://localhost:5173/map-tour.html', { waitUntil: 'networkidle0', timeout: 30000 })
await page.waitForSelector('#tourList', { timeout: 10000 })
const info = await page.evaluate(() => {
  const panel = document.getElementById('layerPanel')
  const list = document.getElementById('tourList')
  const overlay = document.getElementById('tourOverlay')
  const pins = document.getElementById('pinLayer')
  const poi = document.getElementById('poiPop')
  const cs = (el) => el ? getComputedStyle(el) : null
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), hidden: el.hidden, display: getComputedStyle(el).display }
  }
  return {
    app: document.getElementById('app')?.className,
    panel: box(panel),
    list: box(list),
    overlay: box(overlay),
    pins: box(pins),
    poi: box(poi),
    panelVisible: panel && cs(panel).display !== 'none' && !panel.hidden,
    listVisible: list && !list.hidden && cs(list).display !== 'none',
  }
})
await page.screenshot({ path: 'tour-2panel-now.png' })

// click second list card
const clicked = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('#tourList [data-action="tour-item"]')]
  const second = cards[1]
  if (second) second.click()
  const list = document.getElementById('tourList')
  const overlay = document.getElementById('tourOverlay')
  return {
    clicked: second?.dataset.tourId || null,
    listHidden: list?.hidden,
    overlayHidden: overlay?.hidden,
    overlayOn: document.getElementById('app')?.classList.contains('is-tour-overlay'),
  }
})
await page.screenshot({ path: 'tour-2panel-click.png' })
console.log(JSON.stringify({ info, clicked }, null, 2))
await browser.close()
