import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })

const tabs = await page.$$eval('.panel__tab', (els) => els.map((el) => ({
  text: el.textContent.trim(),
  active: el.classList.contains('is-active'),
  hidden: el.hidden,
})))
const chk = await page.$eval('.chk__input:checked + .chk__box', (box) => {
  const img = box.querySelector('img')
  const ics = img ? getComputedStyle(img) : null
  return {
    img: img ? img.getAttribute('src') : null,
    imgDisplay: ics?.display,
    imgW: img ? Math.round(img.getBoundingClientRect().width) : 0,
    imgH: img ? Math.round(img.getBoundingClientRect().height) : 0,
  }
})
console.log('tabs', tabs)
console.log('chk', chk)

await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/panel-tabs.png',
  clip: { x: 80, y: 50, width: 380, height: 220 },
})
const row = await page.$('.tree__d4.is-on')
await row.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/chk-row.png' })
const leaf = await page.$('#leaves-env-policy .tree__d5')
await leaf.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/chk-leaf.png' })

await page.click('[data-action="fav-layer"][data-layer-id="LYR_TIDAL"]')
await page.click('#tabFav')
const fav = await page.evaluate(() => ({
  hidden: document.getElementById('panelFav').hidden,
  listHidden: document.getElementById('panelList').hidden,
  favText: document.getElementById('panelFav').innerText,
  favOn: document.getElementById('tabFav').classList.contains('is-active'),
}))
console.log('fav', fav)
await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/panel-fav.png',
  clip: { x: 80, y: 50, width: 380, height: 280 },
})
await browser.close()
