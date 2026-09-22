import { describe, expect, it } from 'vitest';
import { rewriteProductLinks, type ProductSource } from './product-content';

const product: ProductSource = {
  repository: 'example/tool', commit: 'a'.repeat(40),
  files: { 'README.md': { file: 'tool/index.mdx' }, 'docs/usage.md': { file: 'tool/docs/usage.md' }, 'docs/chart.svg': { file: 'tool/docs/chart.svg' } },
};

describe('repository content links', () => {
  it('routes README, nested docs, and charts locally while keeping code on GitHub', () => {
    expect(rewriteProductLinks('[Guide](docs/usage.md#install) ![Chart](docs/chart.svg) [Code](src/main.rs)', 'README.md', product))
      .toBe(`[Guide](/tool/docs/usage/#install) ![Chart](/tool/docs/chart.svg) [Code](https://github.com/example/tool/blob/${product.commit}/src/main.rs)`);
    expect(rewriteProductLinks('[Home](../README.md)\n\n[guide]: usage.md?view=raw#install', 'docs/usage.md', product))
      .toBe('[Home](/tool/)\n\n[guide]: /tool/docs/usage/?view=raw#install');
  });
  it('leaves examples, external URLs and anchors alone', () => {
    const source = '`[Guide](docs/usage.md)`\n\n```md\n[Guide](docs/usage.md)\n```\n\n[External](https://example.com/docs/usage.md) [Here](#install)';
    expect(rewriteProductLinks(source, 'README.md', product)).toBe(source);
  });
});
