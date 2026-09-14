import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
await page.goto('http://localhost:5173/map.html#tour-overlay', { waitUntil: 'networkidle0' })
await page.click('[data-action="close-tour-overlay"]')
const afterClose = await page.evaluate(() => ({
  list: !document.getElementById('tourList')?.hidden,
  overlay: !document.getElementById('tourOverlay')?.hidden,
  clusters: !document.getElementById('clusterLayer')?.hidden,
}))
console.log('CLOSE_OVERLAY', JSON.stringify(afterClose))

await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
const def = await page.evaluate(() => ({
  tour: document.getElementById('app')?.classList.contains('is-tour'),
  list: document.getElementById('tourList')?.hidden,
  lyr: document.getElementById('lyrList')?.classList.contains('is-open'),
}))
console.log('DEFAULT', JSON.stringify(def))

await page.click('[data-action="info-layer"][data-layer-id="LYR_TOUR"]')
const info = await page.evaluate(() => ({
  overlay: !document.getElementById('tourOverlay')?.hidden,
  meta: !document.getElementById('metaModal')?.hidden,
}))
console.log('TOUR_INFO', JSON.stringify(info))
await browser.close()
