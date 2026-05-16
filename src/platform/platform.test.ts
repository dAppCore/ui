// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPlatform } from './platform';

describe('getPlatform', () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  it('detects macOS from UA string', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    );
    expect(getPlatform()).toBe('macos');
  });
  it('detects iOS from UA string', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    );
    expect(getPlatform()).toBe('ios');
  });
  it('detects Windows from UA string', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    );
    expect(getPlatform()).toBe('windows');
  });
  it('returns "unknown" for an empty UA', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('');
    expect(getPlatform()).toBe('unknown');
  });
});
