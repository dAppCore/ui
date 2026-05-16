// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

export type Platform = 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'unknown';

interface UADataLike {
  platform?: string;
  mobile?: boolean;
}

/** Read the current platform. One-shot — platform does not change at runtime. */
export function getPlatform(): Platform {
  // Modern userAgentData first.
  const ua = (navigator as unknown as { userAgentData?: UADataLike }).userAgentData;
  if (ua?.platform) {
    const p = ua.platform.toLowerCase();
    if (p.includes('mac')) return 'macos';
    if (p.includes('win')) return 'windows';
    if (p.includes('linux')) return 'linux';
    if (p.includes('android')) return 'android';
  }
  // UA-string fallback.
  const s = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(s)) return 'ios';
  if (/android/.test(s)) return 'android';
  if (/mac/.test(s)) return 'macos';
  if (/win/.test(s)) return 'windows';
  if (/linux/.test(s)) return 'linux';
  return 'unknown';
}
