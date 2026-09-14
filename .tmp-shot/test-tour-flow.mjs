import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))

await page.goto('http://localhost:5173/map.html#tour', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
const list = await page.evaluate(() => ({
  tour: document.getElementById('app')?.classList.contains('is-tour'),
  list: !document.getElementById('tourList')?.hidden,
  overlay: !document.getElementById('tourOverlay')?.hidden,
  clusters: !document.getElementById('clusterLayer')?.hidden,
  pins: !document.getElementById('pinLayer')?.hidden,
  lyr: document.getElementById('lyrList')?.classList.contains('is-open'),
  cards: document.querySelectorAll('#tourList .tour__card').length,
  theme: document.getElementById('kids-theme')?.classList.contains('is-open'),
  chk: document.querySelector('[data-layer-id="GRP_TOUR"]')?.checked,
}))
console.log('LIST', JSON.stringify(list))
await page.screenshot({ path: 'tour-list-flow.png' })

await page.click('.tour__card')
await new Promise((r) => setTimeout(r, 300))
const over = await page.evaluate(() => ({
  overlay: !document.getElementById('tourOverlay')?.hidden,
  list: !document.getElementById('tourList')?.hidden,
  pins: !document.getElementById('pinLayer')?.hidden,
  clusters: !document.getElementById('clusterLayer')?.hidden,
  legend: !document.getElementById('legendPop')?.hidden,
  legendTour: document.getElementById('legendPop')?.classList.contains('is-tour'),
  pinOn: document.querySelectorAll('.pin-btn.is-on').length,
}))
console.log('OVERLAY_FROM_CARD', JSON.stringify(over))
await page.screenshot({ path: 'tour-overlay-flow.png' })

await page.click('[data-action="tour-tab"][data-tab="near"]')
const tab = await page.evaluate(() => document.querySelector('#tourPaneNear')?.classList.contains('is-on'))
console.log('TAB_NEAR', tab)

await page.goto('http://localhost:5173/map.html#tour-overlay', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
const hashOver = await page.evaluate(() => ({
  overlay: !document.getElementById('tourOverlay')?.hidden,
  pins: !document.getElementById('pinLayer')?.hidden,
  list: !document.getElementById('tourList')?.hidden,
}))
console.log('HASH_OVERLAY', JSON.stringify(hashOver))

await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
await page.click('[data-action="open-tour"]')
await new Promise((r) => setTimeout(r, 300))
const gnb = await page.evaluate(() => !document.getElementById('tourList')?.hidden)
console.log('GNB', gnb)

await browser.close()
