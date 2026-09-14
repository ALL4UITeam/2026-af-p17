import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))

async function shot(url, name) {
  await page.goto(url, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 400))
  const state = await page.evaluate(() => {
    const tour = document.getElementById('legendTour')
    const main = document.getElementById('legendPop')
    const items = [...(tour?.querySelectorAll('.legend__item') || [])].map((el) => el.textContent.trim())
    const box = tour?.getBoundingClientRect()
    return {
      tourHidden: tour?.hidden,
      mainHidden: main?.hidden,
      items,
      count: items.length,
      width: Math.round(box?.width || 0),
      height: Math.round(box?.height || 0),
      isTour: document.getElementById('app')?.classList.contains('is-tour'),
    }
  })
  console.log(name, JSON.stringify(state))
  await page.screenshot({ path: `.tmp-shot/${name}.png` })
}

await shot('http://localhost:5173/map-legend-tour.html', 'legend-tour')
await shot('http://localhost:5173/map-tour.html', 'legend-on-tour')
await shot('http://localhost:5173/map-legend.html', 'legend-grade')
await shot('http://localhost:5173/map-tour-overlay.html', 'legend-on-overlay')
await shot('http://localhost:5173/map-tour-detail.html', 'legend-on-detail')

await page.goto('http://localhost:5173/map-legend-tour.html', { waitUntil: 'networkidle0' })
await page.click('[data-action="close-legend-tour"]')
await new Promise((r) => setTimeout(r, 200))
const closed = await page.evaluate(() => document.getElementById('legendTour')?.hidden)
console.log('CLOSED', closed)

await browser.close()
