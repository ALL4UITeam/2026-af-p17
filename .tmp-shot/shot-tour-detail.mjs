import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
await page.goto('http://localhost:5173/map.html#tour-overlay', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
const st = await page.evaluate(() => {
  const el = document.getElementById('tourOverlay')
  const r = el?.getBoundingClientRect()
  return {
    hidden: el?.hidden,
    w: Math.round(r?.width || 0),
    h: Math.round(r?.height || 0),
    hero: document.querySelector('.tour__hero-img')?.getAttribute('src'),
    facts: document.querySelectorAll('.tour__fact').length,
    tabs: [...document.querySelectorAll('.tour__tab')].map((t) => t.textContent),
  }
})
console.log(JSON.stringify(st))
const overlay = await page.$('#tourOverlay')
await overlay.screenshot({ path: 'tour-detail-now.png' })
await page.click('[data-action="tour-tab"][data-tab="index"]')
const after = await page.evaluate(() => ({
  factsHidden: document.querySelector('[data-bind="tour-facts"]')?.hidden,
  indexOn: document.getElementById('tourPaneIndex')?.classList.contains('is-on'),
}))
console.log('TAB', JSON.stringify(after))
await browser.close()
