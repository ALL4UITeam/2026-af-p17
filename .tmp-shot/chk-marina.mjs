import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))

await page.goto('http://localhost:5173/map-marina.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 500))
const state = await page.evaluate(() => {
  const list = document.getElementById('marinaList')
  const cards = [...document.querySelectorAll('[data-action="marina-item"]')].map((el) => ({
    name: el.querySelector('.tour__name')?.textContent,
    on: el.classList.contains('is-on'),
  }))
  return {
    marina: document.getElementById('app')?.classList.contains('is-marina'),
    panel: !document.getElementById('layerPanel')?.hidden,
    listHidden: list?.hidden,
    title: list?.querySelector('.tour__title')?.textContent,
    sub: list?.querySelector('.tour__sub-tit')?.textContent,
    cards: cards.length,
    selected: cards.find((c) => c.on)?.name,
    marinaOpen: document.querySelector('[data-group-id="marina"]')?.getAttribute('aria-expanded'),
    leaf: document.querySelector('[data-layer-id="LYR_MARINA_STATUS"]')?.checked,
    leisure: document.querySelector('[data-group-id="leisure"][data-action="toggle"]')?.getAttribute('aria-expanded'),
  }
})
console.log(JSON.stringify(state, null, 2))
await page.screenshot({ path: '.tmp-shot/marina-page.png' })
const list = await page.$('#marinaList')
if (list) await list.screenshot({ path: '.tmp-shot/marina-list-crop.png' })
await browser.close()
