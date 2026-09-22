import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { NavTab } from '../types';
import { Header, formatInstallCommandDisplay, getInstallCommandForPlatform } from './Header';

describe('Header install command', () => {
  it('uses the Windows installer for Windows browser platforms', () => {
    expect(getInstallCommandForPlatform('ctx', 'Windows', undefined)).toBe(
      'irm https://ctx.rs/install.ps1 | iex',
    );
    expect(getInstallCommandForPlatform('graf', 'Win32', undefined)).toBe(
      'irm https://raw.githubusercontent.com/ctxrs/graf/main/install.ps1 | iex',
    );
    expect(getInstallCommandForPlatform('sift', 'Windows', undefined)).toBe(
      'irm https://raw.githubusercontent.com/ctxrs/sift/main/install.ps1 | iex',
    );
  });

  it('uses the active product Unix installer for non-Windows browser platforms', () => {
    expect(getInstallCommandForPlatform('graf', 'MacIntel', undefined)).toBe(
      'curl -fsSL https://raw.githubusercontent.com/ctxrs/graf/main/install.sh | sh',
    );
    expect(getInstallCommandForPlatform('sift', 'Linux x86_64', undefined)).toBe(
      'curl -fsSL https://raw.githubusercontent.com/ctxrs/sift/main/install.sh | sh',
    );
  });

  it('preserves configured install command overrides', () => {
    expect(
      getInstallCommandForPlatform(
        'ctx',
        'Windows',
        'curl -fsSL https://ade.ctx.rs/install | sh',
      ),
    ).toBe('curl -fsSL https://ade.ctx.rs/install | sh');
  });

  it('keeps raw GitHub commands concise in the header', () => {
    expect(
      formatInstallCommandDisplay(
        'irm https://raw.githubusercontent.com/ctxrs/graf/main/install.ps1 | iex',
      ),
    ).toBe('PS> irm …/graf/main/install.ps1 | iex');
  });
});

describe('Header product navigation', () => {
  const tabs: NavTab[] = [
    { external: false, groups: [], href: '/', key: 'ctx', label: 'ctx' },
    { external: false, groups: [], href: '/graf', key: 'graf', label: 'graf' },
    { external: false, groups: [], href: '/sift', key: 'sift', label: 'sift' },
    {
      external: true,
      groups: [],
      href: 'https://github.com/ctxrs/ctx',
      key: 'github',
      label: 'github',
    },
    { external: true, groups: [], href: 'mailto:support@ctx.rs', key: 'support', label: 'support' },
  ];

  it('renders the active product repository and install command', () => {
    const html = renderToStaticMarkup(
      React.createElement(Header, {
        activeTabKey: 'graf',
        onOpenMenu: () => undefined,
        onOpenSearch: () => undefined,
        onSearchIntent: () => undefined,
        tabs,
      }),
    );

    expect(html).toContain('href="https://github.com/ctxrs/graf"');
    expect(html).toContain('$ curl -fsSL …/graf/main/install.sh | sh');
    expect(html).toContain('>ctx</a>');
    expect(html).toContain('>graf</a>');
    expect(html).toContain('>sift</a>');
  });
});
