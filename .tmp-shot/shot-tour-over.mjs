import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map-tour-overlay.html', { waitUntil: 'networkidle0' })
await page.waitForSelector('.tour--over:not([hidden])')

const info = await page.evaluate(() => {
  const overlay = document.querySelector('.tour--over')
  const pane = document.querySelector('.tour__pane.is-on')
  const body = document.querySelector('.tour__over-body')
  const legend = document.querySelector('.legend')
  const or = overlay.getBoundingClientRect()
  const lr = legend.getBoundingClientRect()
  const overlap =
    lr.left < or.right - 1 &&
    lr.right > or.left + 1 &&
    lr.top < or.bottom - 1 &&
    lr.bottom > or.top + 1
  return {
    overlap,
    legend: { x: Math.round(lr.x), w: Math.round(lr.width), z: getComputedStyle(legend).zIndex },
    overlayR: Math.round(or.right),
    paneOverflow: getComputedStyle(pane).overflowY,
    paneScroll: pane.scrollHeight > pane.clientHeight + 2,
    descH: Math.round(pane.scrollHeight),
    paneH: Math.round(pane.clientHeight),
    bodyScroll: body.scrollHeight > body.clientHeight + 2,
    bodySH: body.scrollHeight,
    bodyCH: body.clientHeight,
  }
})
console.log(JSON.stringify(info, null, 2))

await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/tour-over-full.png',
})

await page.$eval('.tour__over-body', (el) => {
  el.scrollTop = el.scrollHeight
})
const last = await page.evaluate(() => {
  const lastFact = document.querySelector('.tour__fact:last-child')
  const r = lastFact.getBoundingClientRect()
  const body = document.querySelector('.tour__over-body').getBoundingClientRect()
  return {
    lastLab: lastFact.querySelector('.tour__fact-lab')?.textContent,
    lastVisible: r.bottom <= body.bottom + 2,
  }
})
console.log(last)
await page.screenshot({
  path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/tour-over-facts.png',
})

await browser.close()
