# Pinterest Blog Content Library

This internal content-operations library holds one ready-to-post Pinterest package for every published article on My House Is Doing What?. It is not part of the production website and must remain outside `public/` and application routes.

## Structure

Packages are grouped as `{category}/{article-slug}/`. Each package contains:

- `pin.webp`: a 1000 × 1500 Pinterest image.
- `pin.md`: the source article, production URL, Pinterest copy, image origin, notes, and status.

The root `index.csv` is the master inventory for filtering or copying package details in bulk.

## Status

- `ready`: title, description, URL, and image are present and have passed the local package audit.
- `needs-review`: something remains unresolved, such as weak copy, an unverified URL, or a questionable image. Do not post these until the note is resolved.

## Image origin

- `lightly adapted`: the article's existing vetted visual was reframed in a vertical branded card. Its technical meaning should remain unchanged.
- `newly created`: a simple Pinterest-only conceptual illustration was made because the article has no registry image.
- `reused`: reserved for a source image that can be used unchanged at the required dimensions.

All current images are WebP files at 1000 × 1500 pixels. The cards use restrained title text and the site's cream, green, and charcoal palette.

## Adding or updating packages

1. Use `content/articles.json` as the published source of truth; do not add backlog-only topics.
2. Add a folder matching the article's category and slug.
3. Create natural Pinterest copy: about 40–80 characters for the title and 120–300 for the description, without hashtags or unsupported promises.
4. Reuse or lightly adapt the article's vetted image first. Create a new simple image only when needed, and check its technical accuracy.
5. Add the row to `index.csv`, then repeat the coverage, copy-length, URL, and image checks used for the current library.

Whenever a new article is published, its Pinterest package is required unless the publishing request explicitly opts out. The package must be completed before the article implementation is reported as fully complete.

Use the established `pin.md` fields in this order: source article, category, production URL, route, Pinterest title, Pinterest description, image, image origin, image notes, and status. Use `./pin.webp` as the image path. Update `index.csv` with exactly one matching row.

Run `npm run verify:pinterest-content` after adding or updating a package. The validator compares this library with the published registry, requires exactly one package and index row per article, verifies required metadata and the WebP file, and rejects duplicate or orphan slugs. A normal new-article publication must preserve the invariant `published articles = Pinterest packages`.

If a package cannot be completed, use `needs-review`, record the reason in `Image notes`, and report the unfinished distribution work. Do not mark the article implementation fully complete. Emergency factual or safety corrections to an existing article are not blocked by this workflow.

This library prepares content only. Posting, scheduling, account access, and external campaigns remain manual.
