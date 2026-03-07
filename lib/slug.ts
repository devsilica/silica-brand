export function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")        // remove quotes
    .replace(/\s+/g, "-")        // spaces -> hyphens
    .replace(/[^a-z0-9-]/g, "")  // remove special chars
    .replace(/-+/g, "-");        // collapse multiple hyphens
}