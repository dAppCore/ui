// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, afterEach } from 'vitest';
import { getNativeShell, isNativeShell } from './native';

describe('getNativeShell', () => {
  afterEach(() => {
    delete (window as any).go;
    delete (window as any).webkit;
  });
  it('returns null in a plain browser', () => {
    expect(getNativeShell()).toBeNull();
    expect(isNativeShell()).toBe(false);
  });
  it('detects Wails via window.go', () => {
    (window as any).go = { __wails: true };
    expect(getNativeShell()).toBe('wails');
    expect(isNativeShell()).toBe(true);
  });
});
