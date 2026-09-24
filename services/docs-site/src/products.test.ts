import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { getSiteData } from './lib/site-data';
import { renderRoute } from './render';

it('keeps one docs tab with Graph and Sift settings in the sidebar', () => {
  const site = getSiteData();
  expect(site.tabs.map(tab => tab.label)).toEqual(['docs', 'github', 'support']);
  const docs = site.tabs[0];
  expect(docs?.groups.find(group => group.label === 'Graph')?.pages).toEqual(['/graph', '/graph/settings']);
  expect(docs?.groups.find(group => group.label === 'Sift')?.pages).toEqual(['/sift', '/sift/settings']);
  for (const pathname of ['/graph', '/graph/settings', '/sift', '/sift/settings']) {
    expect(site.pages[pathname]?.tabKey).toBe('docs');
    expect(renderRoute(pathname).html).toContain('article-header');
  }
  expect(renderRoute('/').html).toContain('src="/docs/assets/ctx-readme-banner.png"');
  expect(site.pages['/']?.html).toContain('ctx graph is Graphify');
  expect(site.pages['/']?.html).toContain('ctx sift');
  expect(site.pages['/']?.html).toContain('src="/docs/assets/ctx-graph-vscode-performance.svg"');
});

it('keeps published standalone links pointing at the unified docs', () => {
  const site = getSiteData();
  expect(site.redirects['/graf']).toBe('/graph');
  expect(site.redirects['/graf/docs/usage']).toBe('/graph/settings');
  expect(site.redirects['/sift/INTEGRATIONS']).toBe('/sift/settings');
  expect(site.redirects['/sift/docs/reference']).toBe('/sift/settings');
  expect(site.redirects['/graf/index.md']).toBe('/graph/index.md');
  expect(site.redirects['/sift/benchmarks/index.md']).toBe('/sift/index.md');
  const asset = (name: string) => readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8');
  expect(asset('search-index.json')).toContain('"/graph"');
  expect(asset('search-index.json')).toContain('"/sift/settings"');
  expect(asset('sitemap.xml')).toContain('<loc>https://ctx.rs/graph/</loc>');
  expect(asset('llms.txt')).toContain('https://ctx.rs/sift/index.md');
  expect(asset('graph/index.md')).toContain('ctx graph');
  expect(asset('sift/settings.md')).toContain('ctx sift');
});
