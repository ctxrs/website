import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { NavTab } from '../types';
import { Header, formatInstallCommandDisplay, getInstallCommandForPlatform } from './Header';

describe('Header install command', () => {
  it('uses one ctx installer across the docs', () => {
    expect(getInstallCommandForPlatform('Windows')).toBe('irm https://ctx.rs/install.ps1 | iex');
    expect(getInstallCommandForPlatform('MacIntel')).toBe('curl -fsSL https://ctx.rs/install | sh');
    expect(getInstallCommandForPlatform('Linux x86_64')).toBe('curl -fsSL https://ctx.rs/install | sh');
  });

  it('preserves configured install command overrides', () => {
    expect(getInstallCommandForPlatform('Windows', 'curl -fsSL https://ade.ctx.rs/install | sh'))
      .toBe('curl -fsSL https://ade.ctx.rs/install | sh');
  });

  it('formats the command in the header', () => {
    expect(formatInstallCommandDisplay('irm https://ctx.rs/install.ps1 | iex'))
      .toBe('PS> irm ctx.rs/install.ps1 | iex');
  });
});

describe('Header navigation', () => {
  const tabs: NavTab[] = [
    { external: false, groups: [], href: '/', key: 'docs', label: 'docs' },
    { external: true, groups: [], href: 'https://github.com/ctxrs/ctx', key: 'github', label: 'github' },
    { external: true, groups: [], href: 'mailto:support@ctx.rs', key: 'support', label: 'support' },
  ];

  it('renders docs, GitHub, support and the ctx installer', () => {
    const html = renderToStaticMarkup(
      React.createElement(Header, {
        activeTabKey: 'docs',
        onOpenMenu: () => undefined,
        onOpenSearch: () => undefined,
        onSearchIntent: () => undefined,
        tabs,
      }),
    );
    expect(html).toContain('href="https://github.com/ctxrs/ctx"');
    expect(html).toContain('$ curl -fsSL ctx.rs/install | sh');
    expect(html).toContain('>docs</a>');
    expect(html).not.toContain('>graf</a>');
    expect(html).not.toContain('>sift</a>');
  });
});
