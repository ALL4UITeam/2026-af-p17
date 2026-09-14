import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })
await page.goto('http://localhost:5173/map-lyr.html', { waitUntil: 'networkidle0', timeout: 30000 })
await page.waitForSelector('#lyrList')
const before = await page.evaluate(() => {
  const row = document.querySelector('.lyr-list__row')
  const tip = row.querySelector('.lyr-list__tip')
  const opac = row.querySelector('.lyr-list__opac')
  return {
    imgs: document.querySelectorAll('#lyrList img').length,
    tipBtns: document.querySelectorAll('.lyr-list__tip-btn').length,
    hoverShow: getComputedStyle(tip).display,
    opacTag: opac.tagName,
    opacSize: { w: opac.offsetWidth, h: opac.offsetHeight },
    mark: getComputedStyle(row.querySelector('.lyr-list__mark')).backgroundImage.includes('mark.svg'),
  }
})
await page.hover('.lyr-list__opac')
const afterHover = await page.evaluate(() => getComputedStyle(document.querySelector('.lyr-list__tip')).display)
await page.click('.lyr-list__opac')
const afterClick = await page.evaluate(() => {
  const row = document.querySelector('.lyr-list__row')
  const tip = row.querySelector('.lyr-list__tip')
  return {
    display: getComputedStyle(tip).display,
    isTip: row.classList.contains('is-tip'),
    html: tip.innerHTML.replace(/\s+/g, ' ').trim(),
    tipBox: tip.getBoundingClientRect().toJSON(),
  }
})
const list = await page.$('#lyrList')
await list.screenshot({ path: 'lyr-opac-click.png' })
await page.click('.lyr-list__title')
const afterOut = await page.evaluate(() => ({
  display: getComputedStyle(document.querySelector('.lyr-list__tip')).display,
  isTip: document.querySelector('.lyr-list__row').classList.contains('is-tip'),
}))
console.log(JSON.stringify({ before, afterHover, afterClick, afterOut }, null, 2))
await browser.close()
