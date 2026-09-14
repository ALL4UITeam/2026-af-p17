import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 360, height: 768, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map.html#mo-filter', { waitUntil: 'networkidle0' })
const info = await page.evaluate(() => {
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }
  }
  return {
    mast: box(document.querySelector('.mo-mast')),
    bar: box(document.querySelector('.mo-bar')),
    search: getComputedStyle(document.querySelector('.mo-search')).display,
    flt: box(document.getElementById('filterPop')),
    head: box(document.querySelector('.flt__head')),
    close: box(document.querySelector('.flt__close')),
    apply: box(document.querySelector('.flt__apply')),
    chipOn: document.querySelectorAll('.flt__chip.is-on').length,
  }
})
console.log(JSON.stringify(info, null, 2))
await page.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/flt-mo-fresh.png' })
await browser.close()
