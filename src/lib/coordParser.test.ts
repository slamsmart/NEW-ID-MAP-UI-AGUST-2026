import { describe, it, expect } from 'vitest';
import { parseCoord, parseLatLng, toDMS } from './coordParser';

describe('parseCoord', () => {
  it('parses decimal', () => {
    expect(parseCoord('-8.430556')).toBe('-8.430556');
    expect(parseCoord('112.635481')).toBe('112.635481');
  });

  it('parses decimal with direction', () => {
    expect(parseCoord('8.430556 S')).toBe('-8.430556');
    expect(parseCoord('112.635481 E')).toBe('112.635481');
  });
});

describe('parseLatLng', () => {
  it('parses google maps style', () => {
    const r = parseLatLng('-8.430556, 112.635481');
    expect(r).toEqual({ lat: '-8.430556', lng: '112.635481' });
  });

  it('returns null on garbage', () => {
    expect(parseLatLng('bukan-koordinat')).toBeNull();
  });
});

describe('toDMS', () => {
  it('formats latitude south', () => {
    const dms = toDMS(-8.430556, true);
    expect(dms).toContain('S');
    expect(dms.startsWith('8')).toBe(true);
  });

  it('formats longitude east', () => {
    const dms = toDMS(112.635481, false);
    expect(dms).toContain('E');
  });
});
