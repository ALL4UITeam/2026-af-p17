import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
await page.goto('http://localhost:5173/map.html', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))

const vis = async (sel) => page.$eval(sel, (el) => {
  const s = getComputedStyle(el)
  return { display: s.display, hidden: el.hidden, open: el.classList.contains('is-open') }
}).catch(() => null)

console.log('industry branch before', await vis('#kids-industry'))
await page.click('[data-group-id="industry"][data-action="toggle"]')
await new Promise((r) => setTimeout(r, 150))
console.log('industry after click', await vis('#kids-industry'))

const envLeavesBefore = await vis('#leaves-env-policy')
const conserveBefore = await page.$eval('.tree__d4-txt', () => {
  const rows = [...document.querySelectorAll('.tree__d4-txt')]
  return rows.map((el) => el.textContent)
})
console.log('d4 names', conserveBefore.join(','))
console.log('env leaves before', envLeavesBefore)
await page.click('[aria-controls="leaves-env-policy"]')
await new Promise((r) => setTimeout(r, 150))
console.log('env leaves after minus', await vis('#leaves-env-policy'))
console.log('env branch still open', await vis('#kids-env'))

await page.click('[data-group-id="fish"][data-action="toggle"]')
await new Promise((r) => setTimeout(r, 150))
console.log('fish kids', await vis('#kids-fish'))
await page.click('[data-group-id="fish-d3"][data-action="toggle"]')
await new Promise((r) => setTimeout(r, 150))
console.log('fish d3 branch', await vis('#kids-fish-d3'))
await page.click('[aria-controls="leaves-fish"]')
await new Promise((r) => setTimeout(r, 150))
console.log('fish leaf', await vis('#leaves-fish'))

await page.goto('http://localhost:5173/map.html#tour', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
console.log('theme', await vis('#kids-theme'))
console.log('leisure', await vis('#kids-leisure'))
console.log('tour', await vis('#kids-tour'))
const cats = await page.$$eval('#leaves-tour .tree__leaf', (els) => els.map((el) => el.textContent.trim()))
console.log('tour cats', cats.join(' | '))
await page.screenshot({ path: 'C:/Users/test/Desktop/github/all4land/2026-af-p17/.tmp-shot/tour-tree.png' })
await browser.close()
