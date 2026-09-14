import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })

const pc = await page.evaluate(() => {
  const pcIco = document.querySelector('.lyr-list__close-pc')
  const moIco = document.querySelector('.lyr-list__close-mo')
  return {
    pc: pcIco ? getComputedStyle(pcIco).display : null,
    mo: moIco ? getComputedStyle(moIco).display : null,
    count: document.querySelectorAll('.lyr-list__close img').length,
  }
})
console.log('pc viewport', pc)

const head = await page.$('.lyr-list__head')
await head.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/lyr-head.png' })

await page.setViewport({ width: 390, height: 800, deviceScaleFactor: 1 })
await page.reload({ waitUntil: 'networkidle0' })
await page.evaluate(() => window.MapUI?.openLayerList?.())
await new Promise((r) => setTimeout(r, 200))
const mo = await page.evaluate(() => {
  const pcIco = document.querySelector('.lyr-list__close-pc')
  const moIco = document.querySelector('.lyr-list__close-mo')
  return {
    pc: pcIco ? getComputedStyle(pcIco).display : null,
    mo: moIco ? getComputedStyle(moIco).display : null,
  }
})
console.log('mo viewport', mo)
await browser.close()
