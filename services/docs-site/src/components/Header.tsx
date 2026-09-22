import React, { useEffect, useRef, useState } from 'react';
import { copyText } from '../lib/clipboard';
import type { NavTab } from '../types';
import { ChevronIcon, EllipsisVerticalIcon, MenuIcon, SearchIcon } from './Icons';

void React;

type ProductKey = 'ctx' | 'graf' | 'sift';

const PRODUCTS: Record<
  ProductKey,
  { repository: string; unixInstallCommand: string; windowsInstallCommand: string }
> = {
  ctx: {
    repository: 'https://github.com/ctxrs/ctx',
    unixInstallCommand: 'curl -fsSL https://ctx.rs/install | sh',
    windowsInstallCommand: 'irm https://ctx.rs/install.ps1 | iex',
  },
  graf: {
    repository: 'https://github.com/ctxrs/graf',
    unixInstallCommand:
      'curl -fsSL https://raw.githubusercontent.com/ctxrs/graf/main/install.sh | sh',
    windowsInstallCommand:
      'irm https://raw.githubusercontent.com/ctxrs/graf/main/install.ps1 | iex',
  },
  sift: {
    repository: 'https://github.com/ctxrs/sift',
    unixInstallCommand:
      'curl -fsSL https://raw.githubusercontent.com/ctxrs/sift/main/install.sh | sh',
    windowsInstallCommand:
      'irm https://raw.githubusercontent.com/ctxrs/sift/main/install.ps1 | iex',
  },
};
const CONFIGURED_INSTALL_COMMAND =
  import.meta.env?.VITE_CTX_INSTALL_COMMAND ??
  (typeof process === 'undefined' ? undefined : process.env.VITE_CTX_INSTALL_COMMAND);

interface HeaderProps {
  activeTabKey: string;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onSearchIntent: () => void;
  pageGroupLabel?: string;
  pageTitle?: string;
  tabs: NavTab[];
}

function isActiveLink(activeTabKey: string, tab: NavTab): boolean {
  return !tab.external && tab.key === activeTabKey;
}

function getBrowserPlatform(): string | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return (
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    navigator.userAgent
  );
}

export function getInstallCommandForPlatform(
  product: ProductKey,
  platform: string | undefined,
  configuredCommand?: string,
): string {
  if (product === 'ctx' && configuredCommand !== undefined) {
    return configuredCommand;
  }
  const commands = PRODUCTS[product];
  return platform && /\bwin/i.test(platform)
    ? commands.windowsInstallCommand
    : commands.unixInstallCommand;
}

function getActiveProduct(activeTabKey: string): ProductKey {
  return activeTabKey === 'graf' || activeTabKey === 'sift' ? activeTabKey : 'ctx';
}

export function formatInstallCommandDisplay(command: string): string {
  const prompt = /^irm\b/i.test(command) ? 'PS> ' : '$ ';
  const conciseCommand = command
    .replace('https://raw.githubusercontent.com/ctxrs/', '…/')
    .replace(/https:\/\//g, '');
  return `${prompt}${conciseCommand}`;
}

export function Header({
  activeTabKey,
  onOpenMenu,
  onOpenSearch,
  onSearchIntent,
  pageGroupLabel,
  pageTitle,
  tabs,
}: HeaderProps) {
  const [installCopied, setInstallCopied] = useState(false);
  const [browserPlatform, setBrowserPlatform] = useState<string | undefined>();
  const installResetTimerRef = useRef<number | null>(null);
  const activeProduct = getActiveProduct(activeTabKey);
  const installCommand = getInstallCommandForPlatform(
    activeProduct,
    browserPlatform,
    CONFIGURED_INSTALL_COMMAND,
  );
  const showMobileGroup = activeTabKey !== 'blog' && pageGroupLabel && pageGroupLabel !== pageTitle;
  const installCommandDisplay = formatInstallCommandDisplay(installCommand);

  useEffect(() => {
    return () => {
      if (installResetTimerRef.current !== null) {
        window.clearTimeout(installResetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setBrowserPlatform(getBrowserPlatform());
  }, []);

  useEffect(() => {
    setInstallCopied(false);
    if (installResetTimerRef.current !== null) {
      window.clearTimeout(installResetTimerRef.current);
      installResetTimerRef.current = null;
    }
  }, [activeProduct]);

  async function handleCopyInstallCommand(): Promise<void> {
    try {
      await copyText(installCommand);
      setInstallCopied(true);
      if (installResetTimerRef.current !== null) {
        window.clearTimeout(installResetTimerRef.current);
      }
      installResetTimerRef.current = window.setTimeout(() => {
        setInstallCopied(false);
        installResetTimerRef.current = null;
      }, 1400);
    } catch {
      setInstallCopied(false);
    }
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="header-top">
          <a aria-label="ctx home page" className="brand-link" href="/">
            <span className="brand-wordmark">
              <span className="brand-wordmark-text">ctx</span>
              <span aria-hidden="true" className="brand-wordmark-cursor" />
            </span>
          </a>
          <button
            aria-label="Open search"
            className="header-action-button search-button"
            onFocus={onSearchIntent}
            onMouseEnter={onSearchIntent}
            onClick={onOpenSearch}
            onPointerDown={onSearchIntent}
            type="button"
          >
            <SearchIcon className="search-button-icon" />
            <span className="search-button-label">Search...</span>
            <kbd>
              <span className="search-button-kbd-symbol">⌘</span>
              <span className="search-button-kbd-letter">K</span>
            </kbd>
          </button>
          <button
            aria-label={`Copy ${activeProduct} install command`}
            className={`header-install-copy${installCopied ? ' is-copied' : ''}`}
            onClick={() => {
              void handleCopyInstallCommand();
            }}
            title="Copy install command"
            type="button"
          >
            <svg
              aria-hidden="true"
              className="header-install-frame"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <defs>
                <pattern height="6" id="cta-scan-pattern" patternUnits="userSpaceOnUse" width="2">
                  <rect fill="#33ff33" fillOpacity="0.96" height="3" width="2" x="0" y="0" />
                  <rect fill="#33ff33" fillOpacity="0.32" height="3" width="2" x="0" y="3" />
                </pattern>
                <filter height="116%" id="cta-glow-filter" width="116%" x="-8%" y="-8%">
                  <feGaussianBlur in="SourceGraphic" result="cta_frame_blur_near" stdDeviation="0.65" />
                  <feGaussianBlur in="SourceGraphic" result="cta_frame_blur_far" stdDeviation="1.2" />
                  <feMerge>
                    <feMergeNode in="cta_frame_blur_far" />
                    <feMergeNode in="cta_frame_blur_near" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect className="header-install-frame-glow" height="98" width="98" x="1" y="1" />
              <rect className="header-install-frame-core" height="98" width="98" x="1" y="1" />
              <rect className="header-install-frame-scan" height="98" width="98" x="1" y="1" />
            </svg>
            <span className="header-install-command">{installCommandDisplay}</span>
            <span aria-hidden="true" className="header-install-icon-wrap">
              <span className="header-install-icon-pair header-install-icon-pair-copy">
                <img alt="" className="header-install-icon" src="/icons/copy.svg" />
              </span>
              <span className="header-install-icon-pair header-install-icon-pair-check">
                <img alt="" className="header-install-icon" src="/icons/check.svg" />
              </span>
            </span>
          </button>
          <div className="mobile-header-actions">
            <button
              aria-label="Open search"
              className="mobile-icon-button"
              onFocus={onSearchIntent}
              onClick={onOpenSearch}
              onPointerDown={onSearchIntent}
              type="button"
            >
              <SearchIcon className="mobile-header-icon" />
            </button>
            <button
              aria-label="More actions"
              className="mobile-icon-button is-narrow"
              type="button"
            >
              <EllipsisVerticalIcon className="mobile-header-icon" />
            </button>
          </div>
        </div>
        <nav aria-label="Primary" className="top-nav">
          {tabs.map((tab) => {
            const href = tab.key === 'github' ? PRODUCTS[activeProduct].repository : tab.href;
            return (
              <a
                className={`top-nav-link${isActiveLink(activeTabKey, tab) ? ' is-active' : ''}`}
                href={href}
                key={tab.key}
                rel={tab.external ? 'noreferrer' : undefined}
                target={tab.external ? '_blank' : undefined}
              >
                {tab.label.toLowerCase()}
              </a>
            );
          })}
        </nav>
        <button
          aria-label="Open navigation"
          className="mobile-crumb-row"
          onClick={onOpenMenu}
          type="button"
        >
          <span className="mobile-crumb-menu">
            <MenuIcon className="mobile-menu-icon" />
          </span>
          <span className="mobile-crumb-copy">
            {showMobileGroup ? (
              <span className="mobile-crumb-group">
                <span>{pageGroupLabel}</span>
                <ChevronIcon className="mobile-crumb-separator" />
              </span>
            ) : null}
            <span className="mobile-crumb-title">{pageTitle ?? 'Overview'}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
