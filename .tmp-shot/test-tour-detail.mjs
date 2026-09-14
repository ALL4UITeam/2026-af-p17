import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))

await page.goto('http://localhost:5173/map-tour-detail.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 500))

const s = await page.evaluate(() => {
  const el = document.getElementById('tourDetail')
  const boxes = el?.querySelectorAll('.tdetail__box').length
  const cards = el?.querySelectorAll('.tdetail__card').length
  const rows = el?.querySelectorAll('.tdetail__table tbody tr').length
  const map = el?.querySelector('.tdetail__map img')
  return {
    screen: document.body.dataset.screen,
    open: !el?.hidden,
    title: document.getElementById('tourDetailTitle')?.textContent,
    boxes,
    cards,
    rows,
    mapOk: (map?.naturalWidth || 0) > 0,
    treeTour: document.getElementById('kids-tour')?.classList.contains('is-open'),
    list: !document.getElementById('tourList')?.hidden,
    overlay: !document.getElementById('tourOverlay')?.hidden,
  }
})
console.log('DETAIL', JSON.stringify(s))
await page.screenshot({ path: '.tmp-shot/tour-detail-now.png' })

await page.click('[data-action="tour-near-km"][data-km="5"]')
await new Promise((r) => setTimeout(r, 150))
const km = await page.evaluate(() => ({
  on: document.querySelector('[data-action="tour-near-km"][data-km="5"]')?.classList.contains('is-on'),
  three: document.querySelector('[data-action="tour-near-km"][data-km="3"]')?.classList.contains('is-on'),
}))
console.log('KM', JSON.stringify(km))

await page.click('[data-action="close-tour-detail"]')
await new Promise((r) => setTimeout(r, 150))
const closed = await page.evaluate(() => document.getElementById('tourDetail')?.hidden)
console.log('CLOSED', closed)

await browser.close()
