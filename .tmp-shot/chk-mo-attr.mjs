import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 360, height: 768, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map-mo-attr.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 500))
const info = await page.evaluate(() => {
  const el = document.getElementById('attrPanel')
  const cs = el ? getComputedStyle(el) : null
  const r = el?.getBoundingClientRect()
  return {
    screen: document.body.dataset.screen,
    hidden: el?.hidden,
    display: cs?.display,
    left: cs?.left,
    top: cs?.top,
    width: cs?.width,
    height: cs?.height,
    rect: r && { t: Math.round(r.top), l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
    title: el?.querySelector('.attr__title')?.textContent,
  }
})
console.log(JSON.stringify(info, null, 2))
await page.screenshot({ path: '.tmp-shot/mo-attr.png' })
await browser.close()
