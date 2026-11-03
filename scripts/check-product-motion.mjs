import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DENTIQLY_PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({ headless: true, ...(process.env.DENTIQLY_BROWSER_PATH ? { executablePath: process.env.DENTIQLY_BROWSER_PATH } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const assert = (value, message) => { if (!value) throw new Error(message); };
const base = process.argv[2] || 'http://localhost:5173';
const output = path.join(os.tmpdir(), 'dentiqly-motion-review');
await mkdir(output, { recursive: true });
try {
  await page.addInitScript(() => localStorage.setItem('dentiqly_cookie_consent', 'denied'));
  await page.goto(base);
  const panel = page.locator('#hero-product-panel');
  await panel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  for (const [variant, label] of [['booking','Reservas'],['agenda','Agenda'],['patient','Pacientes'],['finance','Finanzas']]) {
    await page.getByRole('tab', { name: label, exact: true }).click();
    const film = panel.locator('video');
    await film.waitFor();
    await page.waitForFunction(() => {
      const film = document.querySelector('#hero-product-panel video');
      return film && film.readyState >= 2 && film.currentTime > .15;
    });
    const info = await film.evaluate(video => ({ duration: video.duration, width: video.videoWidth, height: video.videoHeight, error: video.error?.message, paused: video.paused }));
    assert(info.duration === 8 && info.width === 1120 && !info.error && !info.paused, `Bad film ${variant}: ${JSON.stringify(info)}`);
    await panel.getByRole('button', { name: 'Pausar demostración', exact: true }).click();
    const before = await film.evaluate(video => video.currentTime);
    await page.waitForTimeout(220);
    assert(await film.evaluate((video, before) => video.paused && Math.abs(video.currentTime - before) < .05, before), `Pause failed ${variant}`);
    await panel.getByRole('button', { name: 'Reproducir demostración', exact: true }).click();
    await page.waitForTimeout(250);
    assert(await film.evaluate(video => !video.paused), `Resume failed ${variant}`);
    const symbol = await page.request.get(`${base}/assets/icons/dentiqly-${variant}.svg`);
    assert(symbol.ok() && (await symbol.text()).includes('<svg'), `Missing icon ${variant}`);
    console.log(`PASS ${variant}: video, duration, pause, resume, SVG asset`);
  }
  await page.getByRole('tab', { name: 'Reservas', exact: true }).click();
  await page.waitForTimeout(350);
  await panel.locator('video').evaluate(video => { video.pause(); video.currentTime = 3.1; });
  await page.waitForTimeout(100);
  await panel.screenshot({ path: path.join(output, 'desktop-card.png') });
  await page.screenshot({ path: path.join(output, 'desktop.png') });
  await panel.getByRole('button', { name: /Ampliar captura/ }).click();
  assert(await page.locator('dialog[open]').count() === 1, 'Real screenshot modal failed');
  await page.keyboard.press('Escape');
  assert(await page.locator('dialog[open]').count() === 0, 'Modal Escape failed');
  await page.getByRole('tab', { name: 'Reservas', exact: true }).focus();
  await page.keyboard.press('End');
  assert(await page.locator('#hero-tab-finance').getAttribute('aria-selected') === 'true', 'End key failed');
  await page.keyboard.press('ArrowRight');
  assert(await page.locator('#hero-tab-booking').getAttribute('aria-selected') === 'true', 'Keyboard wrap failed');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  assert(await panel.locator('video').evaluate(video => video.paused), 'Offscreen film did not pause');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await panel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  assert(await panel.locator('video').evaluate(video => video.paused), 'Reduced motion autoplayed');
  await panel.getByRole('button', { name: 'Reproducir demostración', exact: true }).click();
  await page.waitForTimeout(200);
  assert(await panel.locator('video').evaluate(video => !video.paused), 'Explicit reduced motion play failed');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await panel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    if (width === 390) {
      await page.locator(':focus').evaluate(element => element.blur()).catch(() => {});
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
    }
  }
  for (const label of ['Antes del turno','Durante la atenci\u00f3n','Al cerrar el d\u00eda']) {
    await page.getByRole('tab', { name: new RegExp(label) }).click();
    await page.waitForFunction(() => document.querySelector('#workflow-panel video')?.readyState >= 2);
  }
  assert(!errors.length, errors.join('\n'));
  console.log(`PASS keyboard, modal, reduced motion, offscreen pause, all workflow films, 5 responsive widths, no runtime errors. Review: ${output}`);
} finally { await browser.close(); }
