import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

await page.goto('http://localhost:5173/map-area.html', { waitUntil: 'networkidle0' })
const onPage = await page.evaluate(() => {
  const el = document.getElementById('areaInfo')
  const r = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  const tool = document.querySelector('[data-tool="area"]')
  return {
    hidden: el.hidden,
    text: el.innerText.replace(/\s+/g, ' ').trim(),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    radius: cs.borderRadius,
    blur: cs.backdropFilter,
    tool: tool?.getAttribute('aria-pressed'),
  }
})
console.log('map-area', JSON.stringify(onPage, null, 2))
await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/area-page.png',
})
await page.$eval('#areaInfo', (el) => {
  const r = el.getBoundingClientRect()
  el.dataset.shot = JSON.stringify({ x: r.x, y: r.y, w: r.width, h: r.height })
})
const box = JSON.parse(await page.$eval('#areaInfo', (el) => el.dataset.shot))
await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/area-crop.png',
  clip: {
    x: Math.max(0, box.x - 16),
    y: Math.max(0, box.y - 16),
    width: box.w + 32,
    height: box.h + 32,
  },
})

await page.keyboard.press('Escape')
console.log('after esc', await page.$eval('#areaInfo', (el) => el.hidden))

await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
const onDefault = await page.evaluate(() => {
  const el = document.getElementById('areaInfo')
  return { hidden: el.hidden, tool: document.querySelector('[data-tool="area"]')?.getAttribute('aria-pressed') }
})
console.log('map.html', onDefault)
await page.$eval('[data-tool="area"]', (el) => el.click())
console.log('after tool', await page.evaluate(() => ({
  hidden: document.getElementById('areaInfo').hidden,
  tool: document.querySelector('[data-tool="area"]')?.getAttribute('aria-pressed'),
})))

await browser.close()
