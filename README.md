# ctx.rs

The shared website for [ctx](https://ctx.rs), [graf](https://ctx.rs/graf/), and
[sift](https://ctx.rs/sift/). Product code and releases stay in their own repos.

## Run locally

Use Node.js 22 or newer and pnpm 9.15.1:

```sh
pnpm --dir services/docs-site install --frozen-lockfile
pnpm dev
```

`pnpm test` runs the site tests. `pnpm build` builds the static site into
`services/docs-site/dist`. `pnpm --dir services/docs-site preview` previews it.

## Update content

The READMEs and documentation in each product repo are the content source.
`content-sources.json` records the source commits and pages to publish. To pull
new content, update a product's commit and run:

```sh
pnpm sync graf sift
```

Commit the resulting content changes along with the new pins. Builds use these
checked-in files and do not fetch product documentation from the network.

The sync replaces README banner images with inline headlines using the existing
site typography. It retains the README body. The renderer routes documentation
links within the site and keeps source-code links pointed at the pinned repo.
Site navigation is in `docs-content/docs.json`; rendering and styles are in
`services/docs-site`.

## Deploy

After reviewing and testing the change, `pnpm deploy` publishes to the existing
Cloudflare Pages project `ctx-site`. Deployment is manual and requires Wrangler
authentication. There is no GitHub Actions or automatic Pages deployment.

See [NOTICE](NOTICE) for source attribution and licenses.
