import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { mkdir, mkdtemp, writeFile, readFile, readdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.DENTIQLY_PLAYWRIGHT_MODULE || 'playwright-core')
const root = fileURLToPath(new URL('../', import.meta.url))
const finalOutput = path.join(root, 'public/assets/motion')
const temporary = await mkdtemp(path.join(os.tmpdir(), 'dentiqly-motion-'))
// Export outside Vite's watched tree so overwriting posters cannot reload the studio.
const output = path.join(temporary, 'assets')
await mkdir(output, { recursive: true })
const base = process.argv[2] || 'http://localhost:5173'
const variants = (process.env.DENTIQLY_MOTION_VARIANTS || 'booking,agenda,patient,finance').split(',')
const fps = 15, duration = 8
const browser = await chromium.launch({ headless: true, ...(process.env.DENTIQLY_BROWSER_PATH ? { executablePath: process.env.DENTIQLY_BROWSER_PATH } : {}) })
const page = await browser.newPage({ viewport: { width: 1120, height: 840 }, deviceScaleFactor: 1 })
await page.addInitScript(() => localStorage.setItem('dentiqly_cookie_consent', 'denied'))
await page.goto(base, { waitUntil: 'domcontentloaded' })
await page.locator('h1').waitFor()
await page.evaluate(() => document.fonts.ready)
const errors = []
page.on('pageerror', error => errors.push(error.message))

try {
  for (const variant of variants) {
    const frameDirectory = path.join(temporary, variant)
    await mkdir(frameDirectory)
    await page.evaluate(async variant => {
      document.getElementById('__motion-studio')?.remove()
      const studio = document.createElement('div')
      studio.id = '__motion-studio'
      Object.assign(studio.style, { position: 'fixed', inset: '0', zIndex: '2147483647', width: '1120px', height: '840px' })
      document.body.appendChild(studio)
      document.body.style.overflow = 'hidden'
      const { mountMotionStudio } = await import('/src/components/landing/components/MotionScene.tsx')
      window.__drawDentiqlyMotion = mountMotionStudio(studio, variant)
      window.__drawDentiqlyMotion(0)
      await document.fonts.ready
      await Promise.all([...studio.querySelectorAll('img')].map(image => image.decode().catch(() => {})))
    }, variant)

    const posterAt = variant === 'patient' ? 4.1 : 3.1
    await page.evaluate(time => window.__drawDentiqlyMotion(time), posterAt)
    const poster = await page.screenshot({ path: path.join(output, `${variant}-poster.png`), animations: 'disabled' })
    await sharp(poster).webp({ quality: 94 }).toFile(path.join(output, `${variant}-poster.webp`))
    if (process.env.DENTIQLY_MOTION_POSTERS_ONLY) { console.log(`Poster: ${variant}`); continue }

    for (let frame = 0; frame < fps * duration; frame++) {
      await page.evaluate(time => window.__drawDentiqlyMotion(time), frame / fps)
      await page.screenshot({ path: path.join(frameDirectory, `frame-${String(frame).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 96, animations: 'disabled' })
    }
    const frames = await Promise.all(Array.from({ length: fps * duration }, (_, frame) => readFile(path.join(frameDirectory, `frame-${String(frame).padStart(4, '0')}.jpg`))))
    const result = spawnSync(process.env.DENTIQLY_FFMPEG || 'ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', 'pipe:0', '-c:v', 'libvpx', '-crf', '10', '-b:v', '1000k', '-pix_fmt', 'yuv420p', '-threads', '2', '-an', path.join(output, `${variant}-loop.webm`)], { encoding: 'utf8', input: Buffer.concat(frames) })
    if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'Video encoding failed')
    console.log(`Loop: ${variant} · ${duration}s · ${fps}fps · 1120 × 840`)
  }
  if (errors.length) throw new Error(errors.join('\n'))
  if (!process.env.DENTIQLY_MOTION_POSTERS_ONLY) await writeFile(path.join(output, 'motion-manifest.json'), JSON.stringify({ createdAt: new Date().toISOString(), duration, fps, width: 1120, height: 840, codec: 'VP8', audio: false, source: 'Original code-native motion graphics based on Dentiqly workflows. Illustrative demo data; not a screen recording.', variants }, null, 2) + '\n')
} finally { await browser.close() }
await mkdir(finalOutput, { recursive: true })
for (const file of await readdir(output)) await copyFile(path.join(output, file), path.join(finalOutput, file))
