import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })

await page.click('[data-action="fav-layer"][data-layer-id="LYR_TIDAL"]')
const favDisp = await page.$eval('[data-action="fav-layer"][data-layer-id="LYR_TIDAL"]', (el) => {
  const off = el.querySelector('.ico-off')
  const on = el.querySelector('.ico-on')
  return {
    pressed: el.getAttribute('aria-pressed'),
    off: getComputedStyle(off).display,
    on: getComputedStyle(on).display,
  }
})
console.log('fav', favDisp)
const acts = await page.$('#leaves-env-policy .tree__acts')
await acts.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/acts-fav.png' })

await page.$eval('[data-action="info-layer"][data-layer-id="LYR_TIDAL"]', (el) => el.click())
const infoDisp = await page.$eval('[data-action="info-layer"][data-layer-id="LYR_TIDAL"]', (el) => {
  const off = el.querySelector('.ico-off')
  const on = el.querySelector('.ico-on')
  return {
    pressed: el.getAttribute('aria-pressed'),
    off: getComputedStyle(off).display,
    on: getComputedStyle(on).display,
    modal: document.getElementById('metaModal').hidden,
  }
})
console.log('info', infoDisp)

await page.$eval('.dlg__close', (el) => el.click())
const after = await page.evaluate(() => ({
  info: document.querySelector('[data-action="info-layer"][data-layer-id="LYR_TIDAL"]').getAttribute('aria-pressed'),
  modal: document.getElementById('metaModal').hidden,
}))
console.log('after close', after)
await browser.close()
