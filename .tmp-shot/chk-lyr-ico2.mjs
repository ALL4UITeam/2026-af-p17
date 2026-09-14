import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
const hits = []
page.on('response', (res) => {
  if (res.url().includes('drag.svg') || res.url().includes('set.svg') || res.url().includes('opacity.svg')) {
    hits.push({ url: res.url(), status: res.status(), type: res.headers()['content-type'] })
  }
})
await page.setViewport({ width: 1920, height: 1080 })
await page.goto('http://localhost:5173/map-lyr.html', { waitUntil: 'networkidle0', timeout: 30000 })
const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.lyr-list__grip')).backgroundImage)
const list = await page.$('#lyrList')
await list.screenshot({ path: 'lyr-ico-fix.png' })
console.log(JSON.stringify({ bg, hits }, null, 2))
await browser.close()
