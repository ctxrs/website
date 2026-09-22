import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Content is committed so builds are offline and changes can be reviewed in a PR.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = JSON.parse(await fs.readFile(path.join(root, 'content-sources.json'), 'utf8'));
const selected = process.argv.slice(2);
for (const name of selected) {
  if (!sources[name]) throw new Error(`Unknown product: ${name}`);
}

for (const [product, source] of Object.entries(sources)) {
  if (selected.length && !selected.includes(product)) continue;
  if (!/^[a-f0-9]{40}$/.test(source.commit)) throw new Error(`Pin ${product} to a commit`);
  for (const [sourcePath, page] of Object.entries(source.files)) {
    const response = await fetch(`https://raw.githubusercontent.com/${source.repository}/${source.commit}/${sourcePath}`);
    if (!response.ok) throw new Error(`${sourcePath}: HTTP ${response.status}`);
    let content = Buffer.from(await response.arrayBuffer());
    if (page.title) {
      let body = content.toString('utf8');
      if (page.hero) {
        body = body.replace(/^<img\b[^>]+>\s*/i, '');
        const lines = page.hero.map(line => {
          const words = line.split(new RegExp(`(\\b${product}\\b)`));
          const html = words.map(word => word === product
            ? `<span className="ctx-home-title-wordmark ctx-home-title-wordmark-terminal">${word}</span>`
            : word).join('');
          return `    <span className="ctx-home-title-line">${html}</span>`;
        }).join('\n');
        body = `<div className="ctx-home-title-block">\n  <div className="ctx-home-title-heading" role="heading" aria-level="1">\n${lines}\n  </div>\n</div>\n\n${body}`;
      }
      // README image markup becomes normal Markdown for the shared renderer.
      body = body.replace(/<img\b[^>]*src="([^"]+)"[^>]*>/gi, (tag, src) => {
        const alt = /\balt="([^"]*)"/i.exec(tag)?.[1] ?? '';
        return `![${alt}](${src})`;
      });
      const leadingTitle = /^# ([^\n]+)\r?\n/.exec(body)?.[1];
      const frontmatter = {
        title: leadingTitle ?? page.title,
        sidebarTitle: page.sidebarTitle,
        description: page.description ?? '',
        product,
        productSource: sourcePath,
      };
      content = Buffer.from(`---\n${Object.entries(frontmatter).filter(([,v]) => v !== undefined).map(([k,v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n${body}`);
    }
    const destination = path.resolve(root, 'docs-content', page.file);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, content);
  }
  console.log(`Synced ${product} at ${source.commit}`);
}
