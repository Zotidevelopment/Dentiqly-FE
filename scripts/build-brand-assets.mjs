import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const directory = path.join(root, "public/assets/brand");
const icons = path.join(directory, "icons");
await mkdir(icons, { recursive: true });

// Mechanical web and platform exports of the approved artwork. No redrawing.
const logo = await sharp(path.join(directory, "dentiqly-logo-v2.png"))
  .trim()
  .png()
  .toBuffer();
const mark = await sharp(path.join(directory, "dentiqly-symbol-v2.png"))
  .trim()
  .png()
  .toBuffer();
await sharp(logo)
  .resize({ width: 900 })
  .webp({ quality: 95, alphaQuality: 100 })
  .toFile(path.join(directory, "dentiqly-logo-v2.webp"));
await sharp(mark)
  .resize({ height: 256 })
  .webp({ quality: 95, alphaQuality: 100 })
  .toFile(path.join(directory, "dentiqly-symbol-v2.webp"));

async function inverse(input, destination, width) {
  const { data, info } = await sharp(input)
    .resize({ width })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Keep the alpha silhouette and counters; the inverse logo is monochrome.
  for (let offset = 0; offset < data.length; offset += 4)
    data[offset] = data[offset + 1] = data[offset + 2] = 255;
  const image = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
  await image
    .clone()
    .webp({ lossless: true })
    .toFile(path.join(directory, `${destination}.webp`));
  await image.png().toFile(path.join(directory, `${destination}.png`));
}
await inverse(logo, "dentiqly-logo-white-v2", 900);
await inverse(mark, "dentiqly-symbol-white-v2", 256);

async function icon(size, name, inset = 0.12, opaque = false) {
  const background = opaque ? "#FFFFFF" : { r: 255, g: 255, b: 255, alpha: 0 };
  const inner = Math.round(size * (1 - inset * 2));
  const artwork = await sharp(mark)
    .resize(inner, inner, { fit: "contain", background })
    .png()
    .toBuffer();
  const result = await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: artwork, gravity: "centre" }])
    .png()
    .toBuffer();
  await writeFile(path.join(icons, name), result);
  return result;
}
await icon(180, "apple-touch-icon-v2.png", 0.12, true);
await icon(192, "icon-192-v2.png", 0.08, true);
await icon(512, "icon-512-v2.png", 0.08, true);
await icon(512, "icon-maskable-512-v2.png", 0.2, true);
const frames = [];
for (const size of [16, 32, 48, 64])
  frames.push({ size, png: await icon(size, `favicon-${size}-v2.png`, 0.03) });
const header = Buffer.alloc(6 + frames.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach(({ size, png }, index) => {
  const entry = 6 + index * 16;
  header[entry] = header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
await writeFile(
  path.join(root, "public/favicon.ico"),
  Buffer.concat([header, ...frames.map((frame) => frame.png)]),
);

const logoData = (
  await sharp(logo).resize({ width: 620 }).png().toBuffer()
).toString("base64");
const social = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="630" fill="#EAF2FF"/>
<g fill="none" stroke="#B8CFF2" stroke-width="2"><rect x="1010" y="-80" width="280" height="500" rx="140" transform="rotate(24 1150 170)"/><rect x="-170" y="380" width="310" height="460" rx="150" transform="rotate(24 0 500)"/></g>
<image href="data:image/png;base64,${logoData}" x="100" y="90" width="390" height="105"/>
<g fill="#0B2440" font-family="Arial,sans-serif" font-weight="600" font-size="56"><text x="100" y="310">Tu consultorio, conectado.</text><text x="100" y="380">Tus pacientes, primero.</text></g>
<text x="100" y="458" font-family="Arial,sans-serif" font-size="26" fill="#53677E">Agenda · Historias clínicas · Odontograma · Caja</text>
<rect x="100" y="505" width="232" height="54" rx="12" fill="#2458ED"/><text x="131" y="540" font-family="Arial,sans-serif" font-size="22" fill="white">dentiqly.com</text></svg>`;
await sharp(Buffer.from(social))
  .png()
  .toFile(path.join(directory, "dentiqly-social-v2.png"));
console.log(
  "Brand web exports, inverse logos, platform icons, favicon and social image generated.",
);
