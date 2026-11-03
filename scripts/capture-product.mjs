import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.DENTIQLY_PLAYWRIGHT_MODULE || "playwright-core",
);
const baseUrl = process.argv[2] || "http://localhost:5173";
const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "public/assets/screenshots");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  ...(process.env.DENTIQLY_BROWSER_PATH
    ? { executablePath: process.env.DENTIQLY_BROWSER_PATH }
    : {}),
});
const context = await browser.newContext({
  viewport: { width: 1536, height: 864 },
  deviceScaleFactor: 1.25,
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
const captures = [];
page.on("pageerror", (error) => errors.push(error.message));
await context.addInitScript(() => {
  localStorage.setItem("dentiqly_cookie_consent", "denied");
  sessionStorage.setItem("onboarding_checklist_dismissed_session", "true");
});

async function settle() {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter((image) => image.getBoundingClientRect().width > 0)
        .map((image) => image.decode().catch(() => {})),
    );
  });
  await page.waitForTimeout(600);
}

async function capture(
  name,
  description,
  detailLocator = page.locator(".dentiqly-workspace-main"),
) {
  await settle();
  const filename = `product-${name}-v3`;
  const png = await page.screenshot({
    path: path.join(output, `${filename}.png`),
    animations: "disabled",
  });
  await sharp(png)
    .resize({ width: 1600 })
    .webp({ quality: 92 })
    .toFile(path.join(output, `${filename}.webp`));
  // A second browser capture of the actual content area, not a reconstructed UI.
  const detail = await detailLocator.screenshot({ animations: "disabled" });
  await sharp(detail)
    .resize({ width: 1280 })
    .webp({ quality: 94 })
    .toFile(path.join(output, `${filename}-detail.webp`));
  captures.push({
    view: name,
    description,
    full: `${filename}.png`,
    web: `${filename}.webp`,
    detail: `${filename}-detail.webp`,
    width: 1920,
    height: 1080,
  });
  console.log(`Captured ${name}`);
}

try {
  await page.goto(new URL("/demo", baseUrl).href, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("main h1").first().waitFor();
  await capture(
    "dashboard",
    "Panel principal de Dentiqly con indicadores y agenda del día",
  );

  await page
    .locator(".dentiqly-sidebar")
    .getByRole("button", { name: "Calendario", exact: true })
    .click();
  await page.getByRole("heading", { name: "Calendario de Turnos" }).waitFor();
  await page.getByRole("button", { name: "Semanal", exact: true }).click();
  await capture(
    "calendar",
    "Agenda semanal con profesionales, horarios y estados de turnos",
  );

  await page
    .locator(".dentiqly-sidebar")
    .getByRole("button", { name: "Pacientes", exact: true })
    .click();
  const patient = page
    .locator("tbody tr")
    .filter({ hasText: "Carlos" })
    .first();
  await patient.waitFor();
  await patient.click();
  await page
    .getByRole("heading", { name: "Carlos Sánchez", exact: true })
    .waitFor();
  await capture(
    "patient",
    "Ficha del paciente con información personal, contacto y cobertura",
  );

  await page.getByRole("button", { name: "Odontograma", exact: true }).click();
  await page
    .getByText("Odontograma inicial completo.", { exact: false })
    .click();
  const chartHeading = page.getByRole("heading", {
    name: "Ver Odontograma",
    exact: true,
  });
  await chartHeading.waitFor();
  await capture(
    "odontogram",
    "Odontograma del paciente abierto en el visor clínico",
    chartHeading.locator("xpath=../../../.."),
  );
  await chartHeading
    .locator("xpath=../../..")
    .getByRole("button")
    .last()
    .click();

  await page
    .locator(".dentiqly-sidebar")
    .getByRole("button", { name: "Flujo de caja", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Flujo de Caja", exact: true })
    .waitFor();
  await page.locator("main select").first().selectOption("todos");
  await capture(
    "finance",
    "Flujo de caja con el historial de movimientos, ingresos y egresos del consultorio",
  );

  if (errors.length) throw new Error(errors.join("\n"));
  await writeFile(
    path.join(output, "capture-manifest.json"),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        environment: "Public /demo route, synthetic demonstration data",
        viewport: { width: 1536, height: 864, deviceScaleFactor: 1.25 },
        source:
          "Browser screenshots of the actual React application. No generated or reconstructed interface.",
        captures,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
