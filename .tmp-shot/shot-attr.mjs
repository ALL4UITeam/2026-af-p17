import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map-attr.html', { waitUntil: 'networkidle0' })

const info = await page.evaluate(() => {
  const el = document.getElementById('attrPanel')
  const head = el.querySelector('.attr__head')
  const r = el.getBoundingClientRect()
  return {
    hidden: el.hidden,
    title: getComputedStyle(el.querySelector('.attr__title')).color,
    headBg: getComputedStyle(head).backgroundColor,
    countBg: getComputedStyle(el.querySelector('.attr__count')).backgroundColor,
    page: el.querySelector('.attr__page')?.innerText,
    on: [...el.querySelectorAll('tbody tr.is-on')].map((tr) => tr.cells[0]?.textContent),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
  }
})
console.log(JSON.stringify(info, null, 2))

const box = await page.$('#attrPanel')
await box.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/attr-now.png' })

await page.$eval('tbody tr[data-action="attr-row"]:nth-child(5)', (el) => el.click())
console.log('after click', await page.evaluate(() =>
  [...document.querySelectorAll('#attrPanel tbody tr.is-on')].map((tr) => tr.cells[0]?.textContent),
))

await page.$eval('[data-action="attr-min"]', (el) => el.click())
console.log('min', await page.$eval('#attrPanel', (el) => el.classList.contains('is-min')))
await page.$eval('[data-action="attr-min"]', (el) => el.click())

await browser.close()
