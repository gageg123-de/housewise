import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_HEADERS = ["article_title", "category", "slug", "route", "url", "pinterest_title", "pinterest_description", "image_file", "image_origin", "status"];
const IMAGE_ORIGINS = new Set(["reused", "lightly adapted", "newly created"]);
const STATUSES = new Set(["ready", "needs-review"]);

function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (quoted) throw new Error("index.csv contains an unterminated quoted field");
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function pinValue(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return markdown.match(new RegExp(`^${escaped}:\\r?\\n([^\\r\\n]+)$`, "m"))?.[1].trim();
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function verifyWebp(filePath, errors, label) {
  if (!(await isFile(filePath))) {
    errors.push(`${label}: missing pin.webp`);
    return;
  }
  const image = await readFile(filePath);
  if (image.length < 12 || image.toString("ascii", 0, 4) !== "RIFF" || image.toString("ascii", 8, 12) !== "WEBP") errors.push(`${label}: pin.webp is not a valid WebP container`);
}

export async function verifyPinterestContent({ repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url))), silent = false } = {}) {
  const libraryRoot = path.join(repoRoot, "content-deployment", "pinterest-blog-content");
  const registry = JSON.parse(await readFile(path.join(repoRoot, "content", "articles.json"), "utf8"));
  const csvRows = parseCsv(await readFile(path.join(libraryRoot, "index.csv"), "utf8"));
  const errors = [];
  const headers = csvRows.shift() ?? [];
  if (headers.join("|") !== REQUIRED_HEADERS.join("|")) errors.push(`index.csv headers must be: ${REQUIRED_HEADERS.join(", ")}`);
  const rows = csvRows.map((values, rowIndex) => {
    if (values.length !== headers.length) errors.push(`index.csv row ${rowIndex + 2}: expected ${headers.length} fields, found ${values.length}`);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
  const registrySlugs = new Set();
  const rowSlugs = new Map();
  for (const article of registry) {
    if (registrySlugs.has(article.slug)) errors.push(`${article.slug}: duplicate published article slug`);
    registrySlugs.add(article.slug);
  }
  for (const [index, row] of rows.entries()) {
    for (const header of REQUIRED_HEADERS) if (!row[header]?.trim()) errors.push(`index.csv row ${index + 2}: ${header} is empty`);
    const matches = rowSlugs.get(row.slug) ?? [];
    matches.push(row);
    rowSlugs.set(row.slug, matches);
  }

  const packageKeys = [];
  for (const categoryEntry of await readdir(libraryRoot, { withFileTypes: true })) {
    if (!categoryEntry.isDirectory()) continue;
    for (const packageEntry of await readdir(path.join(libraryRoot, categoryEntry.name), { withFileTypes: true })) {
      if (packageEntry.isDirectory()) packageKeys.push(`${categoryEntry.name}/${packageEntry.name}`);
    }
  }
  const packageKeySet = new Set(packageKeys);

  for (const article of registry) {
    const key = `${article.primary_category}/${article.slug}`;
    const route = `/${key}/`;
    const url = `https://myhouseisdoingwhat.com${route}`;
    const packageRoot = path.join(libraryRoot, article.primary_category, article.slug);
    const matchingRows = rowSlugs.get(article.slug) ?? [];
    if (!packageKeySet.has(key)) errors.push(`${key}: missing package folder`);
    if (matchingRows.length !== 1) errors.push(`${article.slug}: expected exactly one index.csv row, found ${matchingRows.length}`);
    else {
      const row = matchingRows[0];
      const expected = { article_title: article.title, category: article.primary_category, slug: article.slug, route, url, image_file: `${key}/pin.webp` };
      for (const [field, value] of Object.entries(expected)) if (row[field] !== value) errors.push(`${article.slug}: index.csv ${field} must be ${value}`);
      if (!IMAGE_ORIGINS.has(row.image_origin)) errors.push(`${article.slug}: invalid image_origin ${row.image_origin}`);
      if (!STATUSES.has(row.status)) errors.push(`${article.slug}: invalid status ${row.status}`);
      if (row.pinterest_title.length < 40 || row.pinterest_title.length > 80) errors.push(`${article.slug}: Pinterest title must be 40-80 characters`);
      if (row.pinterest_description.length < 120 || row.pinterest_description.length > 300) errors.push(`${article.slug}: Pinterest description must be 120-300 characters`);
    }

    const markdownPath = path.join(packageRoot, "pin.md");
    if (!(await isFile(markdownPath))) errors.push(`${key}: missing pin.md`);
    else {
      const markdown = await readFile(markdownPath, "utf8");
      if (!markdown.startsWith("# Pinterest Package")) errors.push(`${key}: pin.md must start with # Pinterest Package`);
      const expected = { "Source article": article.title, Category: article.primary_category, "Production URL": url, Route: route, Image: "./pin.webp" };
      for (const [label, value] of Object.entries(expected)) if (pinValue(markdown, label) !== value) errors.push(`${key}: pin.md ${label} must be ${value}`);
      for (const label of ["Pinterest title", "Pinterest description", "Image origin", "Image notes", "Status"]) if (!pinValue(markdown, label)) errors.push(`${key}: pin.md is missing ${label}`);
      if (matchingRows.length === 1) {
        const row = matchingRows[0];
        const mirrored = { "Pinterest title": row.pinterest_title, "Pinterest description": row.pinterest_description, "Image origin": row.image_origin, Status: row.status };
        for (const [label, value] of Object.entries(mirrored)) if (pinValue(markdown, label) !== value) errors.push(`${key}: pin.md ${label} does not match index.csv`);
      }
    }
    await verifyWebp(path.join(packageRoot, "pin.webp"), errors, key);
  }

  for (const key of packageKeySet) if (!registrySlugs.has(key.split("/").at(-1))) errors.push(`${key}: orphan package for an unpublished article`);
  for (const slug of rowSlugs.keys()) if (!registrySlugs.has(slug)) errors.push(`${slug}: orphan index.csv row for an unpublished article`);
  if (registry.length !== packageKeySet.size) errors.push(`coverage mismatch: ${registry.length} published articles, ${packageKeySet.size} Pinterest packages`);
  if (registry.length !== rows.length) errors.push(`index mismatch: ${registry.length} published articles, ${rows.length} index.csv rows`);
  if (errors.length) throw new Error(`Pinterest content validation failed:\n- ${errors.join("\n- ")}`);

  const ready = rows.filter((row) => row.status === "ready").length;
  const result = { publishedArticles: registry.length, packages: packageKeySet.size, ready, needsReview: rows.length - ready };
  if (!silent) console.log(`Pinterest content verified: ${result.publishedArticles}/${result.packages} coverage; ${ready} ready, ${result.needsReview} needs review.`);
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyPinterestContent().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
