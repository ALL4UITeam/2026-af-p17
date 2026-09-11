import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dest = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'img', 'mo')
const files = [
  ['9dfc0d60-aa9b-454a-99e3-d03fb54d1f5e.svg', 'plus.svg'],
  ['38bf8be9-f6a8-464a-a2b8-b0dec79747da.svg', 'minus.svg'],
  ['3e1066e5-ae5d-46d0-bf36-da9f32fe6ab7.png', 'tool-bg.png'],
  ['b4727000-a84c-4019-ad6f-4f64051e190a.svg', 'layer.svg'],
  ['efe67085-ea29-4ff8-8270-9240bdca2d1a.svg', 'basemap.svg'],
  ['fb687023-f392-4946-8790-6524f768d2eb.svg', 'fullmap.svg'],
  ['bc8fdac6-f3f1-4c62-8359-3ebb9a41b6f7.png', 'hdr-bg.png'],
  ['3c589f9f-72f7-4184-ae66-2dd5b3926822.svg', 'flag.svg'],
  ['b4e33ef4-998b-4c37-9aa3-9998596a52bf.svg', 'menu.svg'],
  ['4aa61778-ed6a-4ff2-8666-b794775fd81a.svg', 'logo.svg'],
  ['16d2494f-db34-493c-b81d-e3d58fc5a5d6.svg', 'user.svg'],
  ['1dda373c-9387-4ee0-978d-0051b65167d9.svg', 'list.svg'],
  ['7a212cc7-ebbc-4750-be00-7ca78fb8b789.svg', 'search.svg'],
  ['0b3efb46-f1fb-4d46-84e2-d58f30977088.svg', 'filter.svg'],
  ['99656d21-2859-4612-b50e-c2aa58270635.png', 'map-bg.png'],
  ['5bb6637a-59e1-4ea4-ace5-c2cce2d44e75.svg', 'sheet-up.svg'],
  ['689d35ed-3c17-431d-80fc-5840afd9da7a.svg', 'suggest.svg'],
]

fs.mkdirSync(dest, { recursive: true })
let ok = 0
for (const [id, name] of files) {
  const res = await fetch(`https://www.figma.com/api/mcp/asset/${id}`)
  if (!res.ok) {
    console.error('FAIL', name, res.status)
    continue
  }
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(path.join(dest, name), buf)
  ok += 1
}
console.log(`OK=${ok}`)
