import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))

await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
const before = await page.evaluate(() => document.getElementById('coordPop')?.hidden)
await page.click('[data-action="coord-search"]')
await new Promise((r) => setTimeout(r, 200))
const afterClick = await page.evaluate(() => {
  const pop = document.getElementById('coordPop')
  return {
    hidden: pop?.hidden,
    title: pop?.querySelector('.coord-pop__note-tit')?.textContent,
    expanded: document.querySelector('[data-action="coord-search"]')?.getAttribute('aria-expanded'),
  }
})
console.log('before', before)
console.log('click', JSON.stringify(afterClick, null, 2))
await page.screenshot({ path: '.tmp-shot/coord-from-search.png' })
const pop = await page.$('#coordPop')
if (pop) await pop.screenshot({ path: '.tmp-shot/coord-pop-crop.png' })

await page.goto('http://localhost:5173/map-coord.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
const boot = await page.evaluate(() => document.getElementById('coordPop')?.hidden)
console.log('boot hidden', boot)
await page.screenshot({ path: '.tmp-shot/coord-boot.png' })

await browser.close()
