import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { getSiteData } from './lib/site-data';
import { renderRoute } from './render';

it('publishes separate product sections with the existing inline hero style', () => {
  const site = getSiteData();
  expect(site.tabs.map(tab => tab.label)).toEqual(['ctx', 'graf', 'sift', 'github', 'support']);
  for (const product of ['graf', 'sift']) {
    const home = renderRoute(`/${product}`);
    expect(home.html).not.toContain('article-header');
    expect(home.html).toContain('ctx-home-title-wordmark-terminal');
    expect(home.html).not.toContain('readme-banner');
    const tab = site.tabs.find(tab => tab.key === product)!;
    for (const pathname of tab.groups.flatMap(group => group.pages)) {
      expect(site.pages[pathname]?.tabKey).toBe(product);
    }
  }
  expect(site.pages['/graf']?.html).toContain('href="/graf/docs/migrate-from-graphify/');
  expect(site.pages['/graf']?.html).toContain('src="/graf/docs/assets/graf-vscode-performance.svg"');
  expect(site.pages['/sift']?.html).toContain('href="/sift/INTEGRATIONS/');
});

it('makes product content discoverable in search, sitemaps and Markdown', () => {
  const asset = (name: string) => readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8');
  for (const product of ['graf', 'sift']) {
    expect(asset('search-index.json')).toContain(`"/${product}"`);
    expect(asset('sitemap.xml')).toContain(`<loc>https://ctx.rs/${product}/</loc>`);
    expect(asset('llms.txt')).toContain(`https://ctx.rs/${product}/index.md`);
    expect(asset(`${product}/index.md`)).toContain(`/${product}/`);
  }
});
