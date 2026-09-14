import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))

await page.goto('http://localhost:5173/map-marina.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 600))

const boot = await page.evaluate(() => {
  const pins = document.getElementById('marinaPins')
  const poi = document.getElementById('marinaPoi')
  const onPin = document.querySelector('[data-action="marina-pin"].is-on')
  return {
    marina: document.getElementById('app')?.classList.contains('is-marina'),
    listHidden: document.getElementById('marinaList')?.hidden,
    pinsHidden: pins?.hidden,
    pinCount: pins?.querySelectorAll('[data-action="marina-pin"]').length,
    onPin: onPin?.dataset.marinaId,
    poiHidden: poi?.hidden,
    poiTitle: poi?.querySelector('[data-bind="marina-poi-title"]')?.textContent,
    poiThumb: poi?.querySelector('[data-bind="marina-poi-thumb"]')?.getAttribute('src'),
    poiZip: poi?.querySelector('[data-bind="marina-poi-zip"]')?.textContent,
    poiPort: poi?.querySelector('[data-bind="marina-poi-port"]')?.textContent,
    hasBtns: !!poi?.querySelector('[data-action="marina-info"]') && !!poi?.querySelector('[data-action="marina-route"]'),
    isThum: poi?.querySelector('.poi')?.classList.contains('poi--thum'),
    poiLeft: poi?.style.left,
    poiTop: poi?.style.top,
    tourPinsHidden: document.getElementById('pinLayer')?.hidden,
  }
})
console.log('boot', JSON.stringify(boot, null, 2))
await page.screenshot({ path: '.tmp-shot/marina-poi-boot.png' })

await page.click('[data-action="marina-item"][data-marina-id="marina-10"]')
await new Promise((r) => setTimeout(r, 300))
const afterClick = await page.evaluate(() => {
  const poi = document.getElementById('marinaPoi')
  return {
    selectedCard: document.querySelector('[data-action="marina-item"].is-on')?.dataset.marinaId,
    onPin: document.querySelector('[data-action="marina-pin"].is-on')?.dataset.marinaId,
    poiTitle: poi?.querySelector('[data-bind="marina-poi-title"]')?.textContent,
    poiCity: poi?.querySelector('[data-bind="marina-poi-city"]')?.textContent,
    listStillOpen: document.getElementById('marinaList')?.hidden === false,
  }
})
console.log('click', JSON.stringify(afterClick, null, 2))
await page.screenshot({ path: '.tmp-shot/marina-poi-click.png' })

await page.click('[data-action="marina-item"][data-marina-id="marina-2"]')
await new Promise((r) => setTimeout(r, 300))
await page.screenshot({ path: '.tmp-shot/marina-poi-jukrim.png' })
const poi = await page.$('#marinaPoi')
if (poi) await poi.screenshot({ path: '.tmp-shot/marina-poi-crop.png' })

await browser.close()
