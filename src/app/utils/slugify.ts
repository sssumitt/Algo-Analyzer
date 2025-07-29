// src/app/utils/slugify.ts
export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')   // spaces → dash
    .replace(/^-+|-+$/g, '')       // trim leading/trailing dashes
}
