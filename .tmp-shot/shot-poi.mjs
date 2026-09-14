import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 1100, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/guide.html#poi', { waitUntil: 'networkidle0' })
await page.$eval('#poi', (el) => el.scrollIntoView({ block: 'start' }))
await new Promise((r) => setTimeout(r, 400))
const el = await page.$('#poi')
await el.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/guide-poi.png' })
const play = await page.$('#poi .g-play--map')
await play.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/guide-poi-play.png' })
const boxes = await page.$$eval('#poi .poi', (els) => els.map((el) => ({
  cls: el.className,
  w: Math.round(el.getBoundingClientRect().width),
  h: Math.round(el.getBoundingClientRect().height),
})))
console.log(JSON.stringify(boxes, null, 2))
const thum = await page.$eval('#poi .poi--thum .poi__thum', (el) => {
  const r = el.getBoundingClientRect()
  return { w: Math.round(r.width), h: Math.round(r.height) }
})
const btn = await page.$eval('#poi .poi__btn', (el) => {
  const r = el.getBoundingClientRect()
  const img = el.querySelector('img')
  const ir = img.getBoundingClientRect()
  return { w: Math.round(r.width), h: Math.round(r.height), ico: { w: Math.round(ir.width), h: Math.round(ir.height) } }
})
const mark = await page.$eval('#poi .poi__mark', (el) => {
  const r = el.getBoundingClientRect()
  const img = el.querySelector('img')
  const ir = img.getBoundingClientRect()
  return { w: Math.round(r.width), h: Math.round(r.height), ico: { w: Math.round(ir.width), h: Math.round(ir.height) } }
})
const tail = await page.$eval('#poi .poi__tail', (el) => {
  const r = el.getBoundingClientRect()
  return { w: Math.round(r.width), h: Math.round(r.height) }
})
console.log('thum', thum, 'btn', btn, 'mark', mark, 'tail', tail)
await browser.close()
