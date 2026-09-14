import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
const dump = await page.evaluate(() => {
  const has = typeof MapUI !== 'undefined' && typeof MapUI.openTour
  const themeBtn = document.querySelector('[data-action="toggle"][data-group-id="theme"]')
  return {
    hasOpenTour: has,
    themeBtn: themeBtn ? { exp: themeBtn.getAttribute('aria-expanded'), ctrl: themeBtn.getAttribute('aria-controls'), toggle: themeBtn.dataset.toggle } : null,
    kids: !!document.getElementById('kids-theme'),
  }
})
console.log('dump', JSON.stringify(dump))
await page.evaluate(() => MapUI.openTour())
const after = await page.evaluate(() => ({
  themeOpen: document.getElementById('kids-theme')?.classList.contains('is-open'),
  themeDisplay: getComputedStyle(document.getElementById('kids-theme')).display,
  leisureOpen: document.getElementById('kids-leisure')?.classList.contains('is-open'),
  tourOpen: document.getElementById('kids-tour')?.classList.contains('is-open'),
  themeExp: document.querySelector('[data-action="toggle"][data-group-id="theme"]')?.getAttribute('aria-expanded'),
}))
console.log('after openTour', JSON.stringify(after))

await page.click('[data-group-id="fish"][data-action="toggle"]')
await page.click('[data-group-id="fish-d3"][data-action="toggle"]')
const leafBtn = await page.$eval('[aria-controls="leaves-fish"]', (el) => ({
  tag: el.tagName, exp: el.getAttribute('aria-expanded'), vis: !!(el.offsetWidth || el.offsetHeight),
}))
console.log('leafBtn', JSON.stringify(leafBtn))
await page.$eval('[aria-controls="leaves-fish"]', (el) => el.click())
const leaf = await page.$eval('#leaves-fish', (el) => ({ hidden: el.hidden, open: el.classList.contains('is-open'), display: getComputedStyle(el).display }))
console.log('leaf after', JSON.stringify(leaf))
await page.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/tour-open.png', clip: { x: 80, y: 40, width: 380, height: 820 } })
await browser.close()
