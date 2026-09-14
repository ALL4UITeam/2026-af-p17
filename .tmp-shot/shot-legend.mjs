import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 })
await page.goto('http://localhost:5173/map-legend-mgmt.html', { waitUntil: 'networkidle0' })

const info = await page.evaluate(() => {
  const el = document.getElementById('legendPop')
  const imgs = [...el.querySelectorAll('#legendPaneMgmt .legend__swatch-img')].map((img) => ({
    src: img.getAttribute('src'),
    w: img.naturalWidth,
    h: img.naturalHeight,
    complete: img.complete,
  }))
  return {
    hidden: el.hidden,
    pane: el.querySelector('#legendPaneMgmt')?.classList.contains('is-on'),
    tab: el.querySelector('.legend__tab.is-on')?.textContent,
    dashCss: el.querySelectorAll('.legend__swatch--dash').length,
    imgs,
  }
})
console.log(JSON.stringify(info, null, 2))

const box = await page.$('#legendPop')
await box.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/legend-mgmt-now.png' })
await browser.close()
