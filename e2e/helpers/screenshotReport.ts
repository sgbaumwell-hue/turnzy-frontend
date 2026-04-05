import * as fs from 'fs'
import * as path from 'path'

export function generateScreenshotIndex() {
  const screenshotsDir = path.join(process.cwd(), 'e2e', 'screenshots')
  if (!fs.existsSync(screenshotsDir)) {
    console.log('No screenshots directory found')
    return
  }

  const scenarios = fs.readdirSync(screenshotsDir)
    .filter(f => {
      try { return fs.statSync(path.join(screenshotsDir, f)).isDirectory() }
      catch { return false }
    })
    .sort()

  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Turnzy QA Screenshots</title>
  <style>
    body { font-family: system-ui; padding: 20px; background: #f5f5f5; max-width: 1200px; margin: 0 auto; }
    h1 { color: #1a1a1a; }
    .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
    .scenario { margin: 20px 0; background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .scenario h3 { margin: 0 0 12px; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .devices { display: flex; gap: 12px; flex-wrap: wrap; }
    .device { text-align: center; }
    .device img { max-width: 400px; max-height: 300px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
    .device img:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .device p { font-size: 11px; color: #999; margin: 4px 0 0; }
    .count { background: #f0f0f0; border-radius: 4px; padding: 2px 8px; font-size: 12px; }
    .fullscreen { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: none; z-index: 100; cursor: pointer; }
    .fullscreen img { max-width: 95vw; max-height: 95vh; object-fit: contain; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
  </style>
</head>
<body>
  <h1>Turnzy QA Screenshot Gallery</h1>
  <p class="meta">Generated: ${new Date().toLocaleString()} &mdash; <span class="count">${scenarios.length} scenarios captured</span></p>
  <div id="fullscreen" class="fullscreen" onclick="this.style.display='none'"><img id="fsImg" /></div>
`

  for (const scenario of scenarios) {
    const dir = path.join(screenshotsDir, scenario)
    const images = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
    if (images.length === 0) continue

    html += `  <div class="scenario"><h3>${scenario}</h3><div class="devices">`
    for (const img of images) {
      const device = img.replace(/\.(jpg|png)$/, '')
      html += `<div class="device"><img src="${scenario}/${img}" alt="${scenario} ${device}" onclick="document.getElementById('fsImg').src=this.src;document.getElementById('fullscreen').style.display='block'" /><p>${device}</p></div>`
    }
    html += `</div></div>\n`
  }

  html += `</body></html>`

  const indexPath = path.join(screenshotsDir, 'index.html')
  fs.writeFileSync(indexPath, html)
  console.log(`\n📸 Screenshot gallery: ${indexPath}`)
  return indexPath
}
