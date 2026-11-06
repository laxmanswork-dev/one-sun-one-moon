// Builds the optimised images in public/images from the masters in brand-source/.
//
//   npm run assets
//
// Masters are never modified. Re-run after replacing or adding a master.
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const src = (p) => path.join(root, 'brand-source', p)
const out = (p) => path.join(root, 'public', 'images', p)

async function webp(input, output, { width, height, fit = 'cover', position = 'centre', extract, quality = 78 } = {}) {
  await mkdir(path.dirname(out(output)), { recursive: true })
  let img = sharp(src(input))
  if (extract) img = img.extract(extract)
  if (width || height) img = img.resize({ width, height, fit, position, withoutEnlargement: true })
  const info = await img.webp({ quality, effort: 6 }).toFile(out(output))
  console.log(`${output.padEnd(44)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`)
}

// --- Brand board (brand-source/brand-guidelines-2026.png, 1536x1024) --------
const board = 'brand-guidelines-2026.png'
await webp(board, 'brand/brand-guidelines.webp', { quality: 84 })
// 04 Graphic language tiles.
await webp(board, 'brand/motif-sun-disk.webp', { extract: { left: 822, top: 514, width: 152, height: 146 } })
await webp(board, 'brand/motif-crescent-moon.webp', { extract: { left: 987, top: 514, width: 154, height: 146 } })
await webp(board, 'brand/motif-desert-horizon.webp', { extract: { left: 1154, top: 514, width: 155, height: 146 } })
await webp(board, 'brand/motif-film-texture.webp', { extract: { left: 1322, top: 514, width: 161, height: 146 } })
// 05 Brand applications.
await webp(board, 'brand/application-business-card.webp', { extract: { left: 44, top: 780, width: 464, height: 218 } })
await webp(board, 'brand/application-social-post.webp', { extract: { left: 534, top: 780, width: 304, height: 218 } })
await webp(board, 'brand/application-campaign.webp', { extract: { left: 866, top: 780, width: 626, height: 218 } })

// --- Selected work -------------------------------------------------------------
// Garden Cafe — screenshots of the live site + the cafe's own photography.
await webp('work/garden-cafe/site-desktop.png', 'work/garden-cafe/site-desktop.webp', { width: 1440 })
await webp('work/garden-cafe/site-mobile.png', 'work/garden-cafe/site-mobile.webp', { width: 780 })
await webp('work/garden-cafe/night-web.webp', 'work/garden-cafe/after-sunset.webp', { width: 1338 })
await webp('work/garden-cafe/open-air.webp', 'work/garden-cafe/open-air.webp', { width: 1600 })

// Shivdev Holidays — screenshots of the live site + QR travel poster.
await webp('work/shivdev-holidays/site-desktop.png', 'work/shivdev-holidays/site-desktop.webp', { width: 1440 })
await webp('work/shivdev-holidays/site-mobile.png', 'work/shivdev-holidays/site-mobile.webp', { width: 780 })
await webp('work/shivdev-holidays/qr-poster.png', 'work/shivdev-holidays/qr-poster.webp', { width: 1024 })

// CALIOON — brand world imagery.
await webp('work/calioon/calioon-pillar-wall.png', 'work/calioon/pillar-wall.webp', { width: 1408 })
await webp('work/calioon/calioon-pillar.png', 'work/calioon/pillar.webp', { width: 1200 })

// Vainav's Cafeteria — logo + signature-menu visual from the site in development.
await webp('work/vainavs-cafeteria/royal-falooda.webp', 'work/vainavs-cafeteria/royal-falooda.webp', { width: 1407 })
await webp('work/vainavs-cafeteria/logo.webp', 'work/vainavs-cafeteria/logo.webp', { width: 900 })
await webp('work/vainavs-cafeteria/coffee.webp', 'work/vainavs-cafeteria/coffee.webp', { width: 1200 })

// --- Icons (rendered from the hand-built SVG mark) ----------------------------
const icon = path.join(root, 'app', 'icon.svg')
await sharp(icon)
  .resize(180, 180)
  .png()
  .toFile(path.join(root, 'app', 'apple-icon.png'))
await mkdir(path.join(root, 'public', 'icons'), { recursive: true })
for (const size of [192, 512]) {
  await sharp(icon)
    .resize(size, size)
    .png()
    .toFile(path.join(root, 'public', 'icons', `icon-${size}.png`))
}
console.log('icons written')
