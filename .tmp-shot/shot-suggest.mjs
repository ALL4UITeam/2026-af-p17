import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars','--window-size=1280,800'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
const closed = await page.$eval('#suggestBar', (el) => {
  const r = el.getBoundingClientRect()
  const ico = el.querySelector('.suggest__title img')?.getBoundingClientRect()
  const next = el.querySelector('.suggest__next')?.getBoundingClientRect()
  const nextImg = el.querySelector('.suggest__next img')?.getBoundingClientRect()
  return {
    open: el.classList.contains('is-open'),
    w: Math.round(r.width),
    h: Math.round(r.height),
    ico: ico ? { w: Math.round(ico.width), h: Math.round(ico.height) } : null,
    next: next ? { w: Math.round(next.width), h: Math.round(next.height) } : null,
    nextImg: nextImg ? { w: Math.round(nextImg.width), h: Math.round(nextImg.height) } : null,
  }
})
console.log('closed', JSON.stringify(closed))
const bar = await page.$('#suggestBar')
await bar.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/suggest-closed.png' })
await page.click('#suggestBar .suggest__next')
await new Promise((r) => setTimeout(r, 200))
const opened = await page.$eval('#suggestBar', (el) => ({
  open: el.classList.contains('is-open'),
  w: Math.round(el.getBoundingClientRect().width),
  h: Math.round(el.getBoundingClientRect().height),
  chips: el.querySelectorAll('.suggest__chip').length,
}))
console.log('opened', JSON.stringify(opened))
await bar.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/suggest-open.png' })
await page.goto('http://localhost:5173/map.html#suggest', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 300))
const hash = await page.$eval('#suggestBar', (el) => el.classList.contains('is-open'))
console.log('hash-open', hash)
await browser.close()
