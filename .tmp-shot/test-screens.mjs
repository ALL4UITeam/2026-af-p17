import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))

async function check(url) {
  await page.goto(url, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 350))
  const s = await page.evaluate(() => ({
    screen: document.body.dataset.screen || '',
    title: document.title,
    tour: document.getElementById('app')?.classList.contains('is-tour'),
    list: !document.getElementById('tourList')?.hidden,
    overlay: !document.getElementById('tourOverlay')?.hidden,
    modal: !document.getElementById('metaModal')?.hidden,
    filter: !document.getElementById('filterPop')?.hidden,
    attr: !document.getElementById('attrBar')?.hidden,
    eval: !document.getElementById('evalPanel')?.hidden,
    clusters: !document.getElementById('clusterLayer')?.hidden,
    legend: !document.getElementById('legendPop')?.hidden,
    cards: document.querySelectorAll('#tourList .tour__card').length,
  }))
  console.log(url.replace('http://localhost:5173/', ''), JSON.stringify(s))
}

await check('http://localhost:5173/map.html')
await check('http://localhost:5173/map-tour.html')
await check('http://localhost:5173/map-tour-overlay.html')
await check('http://localhost:5173/map-modal.html')
await check('http://localhost:5173/map-filter.html')
await check('http://localhost:5173/map-attr.html')
await check('http://localhost:5173/map-suggest.html')

await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 250))
await page.click('[data-action="open-tour"]')
await new Promise((r) => setTimeout(r, 300))
const fromGnb = await page.evaluate(() => ({
  url: location.pathname,
  tour: document.getElementById('app')?.classList.contains('is-tour'),
  list: !document.getElementById('tourList')?.hidden,
}))
console.log('GNB_INPAGE', JSON.stringify(fromGnb))

await page.goto('http://localhost:5173/map-tour.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 250))
await page.click('.tour__card')
await new Promise((r) => setTimeout(r, 300))
const fromCard = await page.evaluate(() => ({
  overlay: !document.getElementById('tourOverlay')?.hidden,
  list: !document.getElementById('tourList')?.hidden,
}))
console.log('CARD_OVERLAY', JSON.stringify(fromCard))

await browser.close()
