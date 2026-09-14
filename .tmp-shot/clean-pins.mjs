import fs from 'fs'
import path from 'path'

const dir = path.resolve('src/assets/img/pin')
for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.svg'))) {
  const file = path.join(dir, name)
  let s = fs.readFileSync(file, 'utf8')
  s = s.replace(/<rect width="(?:24|36)" height="(?:24|51)" fill="#F5F5F5"\/>\n?/, '')
  s = s.replace(/<rect width="3852" height="3568"[^>]*\/>\n?/, '')
  s = s.replace(/<rect x="[^"]+" y="[^"]+" width="572" height="163"[^>]*\/>\n?/, '')
  fs.writeFileSync(file, s)
  const bad = s.includes('#F5F5F5') || s.includes('#9747FF') || s.includes('3852')
  console.log(name, fs.statSync(file).size, bad ? 'STILL_JUNK' : 'ok')
}
