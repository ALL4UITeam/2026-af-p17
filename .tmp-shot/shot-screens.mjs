import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})

async function state(url) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
  const res = await page.goto(url, { waitUntil: 'networkidle0' })
  const info = await page.evaluate(() => {
    const lyr = document.querySelector('.lyr-list')
    const legend = document.querySelector('.legend')
    const cluster = document.querySelector('#clusterLayer')
    const overlay = document.querySelector('.tour--over')
    const modal = document.querySelector('#metaModal')
    const layerBtn = document.querySelector('[data-tool="layer"]')
    return {
      screen: document.body.dataset.screen || '',
      lyrOpen: lyr?.classList.contains('is-open') === true,
      lyrDisplay: lyr ? getComputedStyle(lyr).display : 'none',
      layerPressed: layerBtn?.getAttribute('aria-pressed') === 'true',
      legendOpen: legend ? !legend.hidden : false,
      clusterOpen: cluster ? !cluster.hidden : false,
      overlayOpen: overlay ? !overlay.hidden : false,
      modalOpen: modal ? !modal.hidden : false,
    }
  })
  const file = url.split('/').pop().replace('.html', '')
  await page.screenshot({
    path: `C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/scr-${file}.png`,
  })
  await page.close()
  return { url, status: res?.status(), ...info }
}

const pages = [
  'http://localhost:5173/map.html',
  'http://localhost:5173/map-cluster.html',
  'http://localhost:5173/map-lyr.html',
  'http://localhost:5173/map-legend.html',
  'http://localhost:5173/map-tour.html',
  'http://localhost:5173/map-tour-overlay.html',
  'http://localhost:5173/map-modal.html',
  'http://localhost:5173/map-basemap.html',
]
for (const url of pages) {
  console.log(JSON.stringify(await state(url)))
}

const clickPage = await browser.newPage()
await clickPage.setViewport({ width: 1280, height: 800 })
await clickPage.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
await clickPage.click('[data-tool="layer"]')
const afterClick = await clickPage.evaluate(() => ({
  lyrOpen: document.querySelector('.lyr-list')?.classList.contains('is-open') === true,
  pressed: document.querySelector('[data-tool="layer"]')?.getAttribute('aria-pressed'),
}))
console.log('click-layer', afterClick)
await clickPage.close()

await browser.close()
