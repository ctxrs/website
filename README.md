# ctx.rs

The docs site for [ctx](https://ctx.rs): agent-history search and blame, codebase
graphs, and Sift output compaction in one CLI. Product code and releases live in
[ctxrs/ctx](https://github.com/ctxrs/ctx).

## Run locally

Use Node.js 22 or newer and pnpm 9.15.1:

```sh
pnpm --dir services/docs-site install --frozen-lockfile
pnpm dev
```

`pnpm test` runs the site tests. `pnpm build` builds the static site into
`services/docs-site/dist`. `pnpm --dir services/docs-site preview` previews it.

## Update content

The main page follows the approved [ctx README](https://github.com/ctxrs/ctx/blob/f94d485b2496665e3dc0fcaf52e747f3e1bfc272/README.md).
Graph and Sift pages follow its examples and the
[unified command guide](https://github.com/ctxrs/ctx/blob/f94d485b2496665e3dc0fcaf52e747f3e1bfc272/docs/unified-context.md).
`content-sources.json` pins the remaining imported history docs. To refresh those,
update the ctx commit and run:

```sh
pnpm sync ctx
```

Commit the resulting content changes along with the new pins. Builds use these
checked-in files and do not fetch product documentation from the network.

The main page is edited in `docs-content/index.mdx` and uses the existing ctx
README banner. Graph and Sift settings and the codebase-graphs comparison are
edited here too, so refreshing older history docs does not restore standalone
product wording.
Site navigation is in `docs-content/docs.json`; rendering and styles are in
`services/docs-site`.

## Deploy

After reviewing and testing the change, `pnpm deploy` publishes to the existing
Cloudflare Pages project `ctx-site`. Deployment is manual and requires Wrangler
authentication. There is no GitHub Actions or automatic Pages deployment.
The installer on this site selects the latest published ctx release. Coordinate
documentation for new commands with the corresponding product release.

See [NOTICE](NOTICE) for source attribution and licenses.
