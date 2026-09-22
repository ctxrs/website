import { describe, expect, it } from 'vitest';
import type { HeadElementDescriptor } from './metadata';
import { buildRouteMetadata } from './metadata';

function findHeadElement(
  headElements: HeadElementDescriptor[],
  tagName: HeadElementDescriptor['tagName'],
  attributeName: string,
  attributeValue: string,
): HeadElementDescriptor | undefined {
  return headElements.find(
    (element) =>
      element.tagName === tagName && element.attributes[attributeName] === attributeValue,
  );
}

function getJsonLdPayloads(headElements: HeadElementDescriptor[]): Array<Record<string, unknown>> {
  return headElements
    .filter(
      (element) =>
        element.tagName === 'script' &&
        element.attributes.type === 'application/ld+json' &&
        element.textContent,
    )
    .map((element) => JSON.parse(element.textContent ?? '{}') as Record<string, unknown>);
}

describe('buildRouteMetadata', () => {
  it('adds Open Graph, Twitter, and homepage schema metadata', () => {
    const metadata = buildRouteMetadata('/');

    expect(
      findHeadElement(metadata.headElements, 'meta', 'property', 'og:title')?.attributes.content,
    ).toBe('ctx | Instant recall for coding agents');
    expect(
      findHeadElement(metadata.headElements, 'meta', 'name', 'twitter:card')?.attributes.content,
    ).toBe('summary_large_image');
    expect(
      findHeadElement(metadata.headElements, 'meta', 'property', 'og:image')?.attributes.content,
    ).toBe('https://ctx.rs/android-chrome-512x512.png');
    expect(
      findHeadElement(metadata.headElements, 'meta', 'name', 'twitter:image')?.attributes.content,
    ).toBe('https://ctx.rs/android-chrome-512x512.png');

    const [homepageGraph] = getJsonLdPayloads(metadata.headElements);
    const graphEntries = (homepageGraph?.['@graph'] ?? []) as Array<Record<string, unknown>>;

    expect(graphEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'Organization',
          legalName: 'ctx engineering inc',
          name: 'ctx engineering inc',
          url: 'https://ctx.rs',
        }),
        expect.objectContaining({
          '@type': 'SoftwareApplication',
          applicationCategory: 'DeveloperApplication',
          image: 'https://ctx.rs/android-chrome-512x512.png',
          name: 'ctx',
          publisher: expect.objectContaining({
            '@type': 'Organization',
            legalName: 'ctx engineering inc',
            name: 'ctx engineering inc',
          }),
        }),
      ]),
    );
  });

  it('uses product metadata and schema on Graf and Sift routes', () => {
    const grafHome = buildRouteMetadata('/graf');
    const grafDocs = buildRouteMetadata('/graf/docs/usage');
    const siftHome = buildRouteMetadata('/sift');

    const grafGraph = getJsonLdPayloads(grafHome.headElements)[0];
    const grafSoftware = ((grafGraph?.['@graph'] ?? []) as Array<Record<string, unknown>>).find(
      (entry) => entry['@type'] === 'SoftwareApplication',
    );
    const siftGraph = getJsonLdPayloads(siftHome.headElements)[0];
    const siftSoftware = ((siftGraph?.['@graph'] ?? []) as Array<Record<string, unknown>>).find(
      (entry) => entry['@type'] === 'SoftwareApplication',
    );

    expect(grafHome.title.toLowerCase()).toContain('graf');
    expect(grafHome.description.toLowerCase()).toContain('code graph');
    expect(grafSoftware).toEqual(
      expect.objectContaining({
        name: 'graf',
        operatingSystem: 'macOS, Linux, Windows',
        url: 'https://ctx.rs/graf/',
      }),
    );
    expect(grafDocs.title).toMatch(/ - graf$/);
    expect(siftHome.title.toLowerCase()).toContain('sift');
    expect(siftHome.description.toLowerCase()).toContain('tool output');
    expect(siftSoftware).toEqual(
      expect.objectContaining({
        name: 'sift',
        operatingSystem: 'macOS, Linux, Windows',
        url: 'https://ctx.rs/sift/',
      }),
    );
  });

  it('adds breadcrumb metadata for docs and legal routes', () => {
    const docsMetadata = buildRouteMetadata('/getting-started/install');
    const firstGroupPageMetadata = buildRouteMetadata('/blame');
    const legalMetadata = buildRouteMetadata('/legal/privacy-policy');

    const docsBreadcrumb = getJsonLdPayloads(docsMetadata.headElements).find(
      (entry) => entry['@type'] === 'BreadcrumbList',
    );
    const firstGroupPageBreadcrumb = getJsonLdPayloads(firstGroupPageMetadata.headElements).find(
      (entry) => entry['@type'] === 'BreadcrumbList',
    );
    const legalBreadcrumb = getJsonLdPayloads(legalMetadata.headElements).find(
      (entry) => entry['@type'] === 'BreadcrumbList',
    );

    expect(
      ((docsBreadcrumb?.itemListElement ?? []) as Array<Record<string, unknown>>).map(
        (item) => item.name,
      ),
    ).toEqual(['Home', 'Start', 'Install and index local history']);
    expect(
      ((firstGroupPageBreadcrumb?.itemListElement ?? []) as Array<Record<string, unknown>>).map(
        (item) => item.name,
      ),
    ).toEqual(['Home', 'Blame: git blame for agent sessions']);
    expect(
      ((firstGroupPageBreadcrumb?.itemListElement ?? []) as Array<Record<string, unknown>>).every(
        (item) => typeof item.item === 'string' && item.item.length > 0,
      ),
    ).toBe(true);
    expect(
      ((legalBreadcrumb?.itemListElement ?? []) as Array<Record<string, unknown>>).map(
        (item) => item.name,
      ),
    ).toEqual(['Home', 'Legal', 'Privacy Policy']);
  });

  it('marks missing routes as noindex and omits canonical tags', () => {
    const metadata = buildRouteMetadata('/does-not-exist');

    expect(
      findHeadElement(metadata.headElements, 'meta', 'name', 'robots')?.attributes.content,
    ).toBe('noindex');
    expect(findHeadElement(metadata.headElements, 'link', 'rel', 'canonical')).toBeUndefined();
    expect(metadata.title).toBe('Page not found - ctx');
    expect(metadata.description).toBe('This route is not part of the current docs set.');
  });

});
