import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
await page.goto('http://localhost:5173/map-mo-lyr.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 500))
const info = await page.evaluate(() => {
  const list = document.getElementById('lyrList')
  const head = list?.querySelector('.lyr-list__head')
  const cs = head ? getComputedStyle(head) : null
  return {
    open: list?.classList.contains('is-open'),
    headBg: cs?.backgroundColor,
    titleColor: list ? getComputedStyle(list.querySelector('.lyr-list__title')).color : null,
    closeBg: list ? getComputedStyle(list.querySelector('.lyr-list__close')).backgroundColor : null,
    total: list?.querySelector('.lyr-list__total')?.textContent,
    totalDisplay: list ? getComputedStyle(list.querySelector('.lyr-list__total')).display : null,
    catCount: list?.querySelector('.lyr-list__cat .count')?.textContent,
    emptyCount: list?.querySelector('.lyr-list__cat.is-empty .count')?.textContent,
    tipDisplay: list ? getComputedStyle(list.querySelector('.is-tip .lyr-list__tip')).display : null,
    ctrlDisplay: list ? getComputedStyle(list.querySelector('.lyr-list__ctrl')).display : null,
    footDisplay: list ? getComputedStyle(list.querySelector('.lyr-list__foot')).display : null,
  }
})
console.log(JSON.stringify(info, null, 2))
await page.screenshot({ path: '.tmp-shot/mo-lyr-now.png' })
await browser.close()
