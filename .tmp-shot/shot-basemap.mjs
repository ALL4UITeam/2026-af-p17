import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map-basemap.html', { waitUntil: 'networkidle0' })
await page.waitForSelector('#basemapPop:not([hidden])')

const dump = await page.evaluate(() => {
  const el = document.getElementById('basemapPop')
  const cs = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  return {
    hidden: el.hidden,
    display: cs.display,
    zIndex: cs.zIndex,
    bg: cs.backgroundColor,
    text: el.innerText,
    htmlThumbs: [...el.querySelectorAll('.bmap__thumb')].map((t) => t.innerHTML),
    lyrClass: document.querySelector('.lyr-list')?.className,
    lyrDisplay: getComputedStyle(document.querySelector('.lyr-list')).display,
    toolBasemap: document.querySelector('[data-tool="basemap"]')?.getAttribute('aria-pressed'),
    toolLayer: document.querySelector('[data-tool="layer"]')?.getAttribute('aria-pressed'),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
  }
})
console.log(JSON.stringify(dump, null, 2))

await page.$eval('#basemapPop', (el) => el.scrollIntoView())
await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/basemap-page.png',
  clip: { x: 820, y: 30, width: 460, height: 460 },
})
await page.$eval('#basemapPop', (el) => {
  el.querySelector('[data-map="enc"]').click()
  el.querySelector('[data-color="#1e2124"]').click()
})
const after = await page.evaluate(() => {
  const el = document.getElementById('basemapPop')
  return {
    on: [...el.querySelectorAll('.bmap__card.is-on')].map((c) => c.dataset.map),
    color: [...el.querySelectorAll('.bmap__chip.is-on')].map((c) => c.dataset.color),
  }
})
console.log('after pick', after)

await page.$eval('[data-action="close-basemap"]', (el) => el.click())
console.log('closed', await page.$eval('#basemapPop', (el) => el.hidden))

await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
await page.$eval('[data-action="tool"][data-tool="basemap"]', (el) => el.click())
const fromMap = await page.evaluate(() => ({
  hidden: document.getElementById('basemapPop').hidden,
  text: document.getElementById('basemapPop').innerText.slice(0, 40),
  layerOpen: document.querySelector('.lyr-list')?.classList.contains('is-open'),
  toolBasemap: document.querySelector('[data-tool="basemap"]')?.getAttribute('aria-pressed'),
  toolLayer: document.querySelector('[data-tool="layer"]')?.getAttribute('aria-pressed'),
}))
console.log('from map.html', fromMap)
await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/basemap-from-map.png',
  clip: { x: 820, y: 30, width: 460, height: 460 },
})

await browser.close()
