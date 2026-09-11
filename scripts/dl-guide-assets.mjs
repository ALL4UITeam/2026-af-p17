import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'img')

const files = [
  ['form', '79dcb8c7-34a5-4c22-a6ed-0c498af4ba02.svg', 'check-disabled.svg'],
  ['form', 'c4631ba9-8f02-46e7-b11c-958121ec502c.svg', 'check-blue.svg'],
  ['form', 'c8c62d9d-f1af-40f1-b9d6-9708a3612a72.svg', 'inq-check.svg'],
  ['analyze', '353192ee-8820-42a3-ad63-6f0918132a3d.svg', 'crop.svg'],
  ['analyze', '24afaf76-94b3-4f29-a027-42761eeaf650.svg', 'density.svg'],
  ['analyze', '576d266c-0fc9-4c4c-99da-692cbbd0e981.svg', 'union.svg'],
  ['analyze', 'cf396f48-6f65-4bce-a33e-893c01f18cca.svg', 'buffer.svg'],
  ['analyze', '26b6ac6b-fa32-4b99-943e-3a52f2f7f202.svg', 'cluster.svg'],
  ['analyze', '7241416c-6f2c-4791-b4aa-37142139d8bc.svg', 'pattern.svg'],
  ['analyze', '96af6b6d-eda3-4f35-8c74-c2d91d4a2758.svg', 'merge.svg'],
  ['analyze', '8cbb9c72-e18d-4f8e-9ce9-e1d31a3862df.svg', 'interp.svg'],
  ['analyze', 'b0b9a89e-5039-4154-b4c1-b8d153b56d23.svg', 'symbol.svg'],
  ['analyze', '5d441a61-1e8e-4f85-8dee-c939b00457fa.svg', 'choropleth.svg'],
  ['analyze', '866d6124-a9e3-4d57-8364-46e8cc80d0b9.svg', 'unique.svg'],
  ['analyze', 'eac1ea9f-72a6-4c54-a3dd-6b84e192e558.svg', 'intersect.svg'],
  ['analyze', '20ccf7f7-9169-41ac-afa9-01eaf07b46f2.svg', 'dist.svg'],
  ['analyze', '8886fa11-bd19-4a2f-85f4-002039a1867e.svg', 'generalize.svg'],
  ['analyze', '260b6b37-77a6-4b7a-bee4-351f95f46623.svg', 'delete.svg'],
  ['analyze', '801b70ff-1067-4e58-9e93-f2c894edcf19.svg', 'geoproc.svg'],
  ['analyze', 'ec95f682-142c-4479-b1db-b1e861fb8f6c.svg', 'geoanal.svg'],
  ['analyze', 'b35b64de-7f90-4d8e-b963-960eafb730ce.svg', 'edit.svg'],
  ['analyze', 'bda9e2fb-727f-4d1f-b6ca-8b1592556b0e.svg', 'attr.svg'],
  ['analyze', '68d8a22e-2550-4567-8320-e88fadcea825.svg', 'move.svg'],
  ['analyze', 'fc4c07f1-f23a-4ac6-8819-176e452d3fc5.svg', 'download.svg'],
  ['analyze', '3cc5bf00-e1d0-4622-88c5-1f8a59a110eb.svg', 'join.svg'],
  ['analyze', '8ec91d4f-b617-4067-bb79-75949d740b7c.svg', 'info.svg'],
]

let ok = 0
for (const [dir, id, name] of files) {
  const destDir = path.join(root, dir)
  fs.mkdirSync(destDir, { recursive: true })
  const res = await fetch(`https://www.figma.com/api/mcp/asset/${id}`)
  if (!res.ok) {
    console.error('FAIL', name, res.status)
    continue
  }
  fs.writeFileSync(path.join(destDir, name), Buffer.from(await res.arrayBuffer()))
  ok += 1
}
console.log(`OK=${ok}/${files.length}`)
