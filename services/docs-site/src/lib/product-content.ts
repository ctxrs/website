import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

export interface ProductSource {
  repository: string;
  commit: string;
  files: Record<string, { file: string }>;
}

/** Keep repository-relative README links useful on the site and in downloads. */
export function rewriteProductLinks(markdown: string, sourcePath: string, product: ProductSource): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const replacements: Array<{ start: number; end: number; text: string }> = [];
  visit(tree, node => {
    if (node.type !== 'link' && node.type !== 'image' && node.type !== 'definition') return;
    const url = node.url;
    if (!url || /^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(url)) return;
    const separator = url.search(/[?#]/);
    const target = separator < 0 ? url : url.slice(0, separator);
    const suffix = separator < 0 ? '' : url.slice(separator);
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), target));
    const page = product.files[resolved];
    let destination: string;
    if (page) {
      destination = /\.mdx?$/.test(page.file)
        ? `/${page.file.replace(/\.mdx?$/, '').replace(/\/index$/, '')}/`
        : `/${page.file}`;
    } else {
      destination = `https://github.com/${product.repository}/blob/${product.commit}/${resolved}`;
    }
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start === undefined || end === undefined) return;
    const offset = markdown.slice(start, end).lastIndexOf(url);
    if (offset < 0) return;
    replacements.push({ start: start + offset, end: start + offset + url.length, text: destination + suffix });
  });
  for (const item of replacements.sort((a, b) => b.start - a.start)) {
    markdown = markdown.slice(0, item.start) + item.text + markdown.slice(item.end);
  }
  return markdown;
}
