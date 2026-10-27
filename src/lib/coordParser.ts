/**
 * coordParser — parse berbagai format koordinat ke decimal degrees.
 *
 * Format yang didukung:
 * 1. Decimal: "-8.430556" atau "8.430556"
 * 2. DMS lengkap: "8°25'50.304\"S" atau "8°25'50.304\"S, 112°38'3.732\"E"
 * 3. DMS tanpa simbol: "8 25 50.304 S"
 * 4. Google Maps style: "-8.430556, 112.635481"
 * 5. Decimal dengan arah: "8.430556 S"
 */

/** Parse satu nilai DMS string ke decimal degrees */
function parseDMS(dms: string): number | null {
  const s = dms.trim();

  // Decimal dengan arah dulu: "8.430556 S" (harus sebelum parseFloat plain)
  const decDirPattern = /^(-?\d+(?:\.\d+)?)\s*([NSEWnsew])$/;
  const decDirMatch = s.match(decDirPattern);
  if (decDirMatch) {
    let decimal = parseFloat(decDirMatch[1]);
    const dir = decDirMatch[2].toUpperCase();
    if (dir === 'S' || dir === 'W') decimal = -Math.abs(decimal);
    if (dir === 'N' || dir === 'E') decimal = Math.abs(decimal);
    return decimal;
  }

  // Decimal plain: "-8.430556"
  if (/^-?\d+(?:\.\d+)?$/.test(s)) {
    const dec = parseFloat(s);
    return isNaN(dec) ? null : dec;
  }

  // DMS: degree symbol or plain spaces
  const dmsPattern = /(\d+)[\u00B0\s]+(\d+)['\s]+(\d+(?:\.\d+)?)["\s]*([NSEWnsew]?)/;
  const match = s.match(dmsPattern);
  if (match) {
    const deg = parseFloat(match[1]);
    const min = parseFloat(match[2]);
    const sec = parseFloat(match[3]);
    const dir = match[4].toUpperCase();
    let decimal = deg + min / 60 + sec / 3600;
    if (dir === 'S' || dir === 'W') decimal = -decimal;
    return decimal;
  }

  return null;
}

/**
 * Parse koordinat tunggal (lat atau lng).
 * Returns decimal string dengan 6 desimal, atau null jika gagal.
 */
export function parseCoord(input: string): string | null {
  const val = parseDMS(input.trim());
  if (val === null || isNaN(val)) return null;
  return val.toFixed(6);
}

/**
 * Parse string koordinat lengkap "lat, lng" dalam berbagai format.
 */
export function parseLatLng(input: string): { lat: string; lng: string } | null {
  const s = input.trim();

  const parts = s.split(/,\s*(?=[0-9-]|[NSEWnsew]?\s*\d)/);

  if (parts.length >= 2) {
    const lat = parseDMS(parts[0].trim());
    const lng = parseDMS(parts.slice(1).join(',').trim());
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
    }
  }

  const dmsAll = /(\d+[\u00B0\s]\d+['\s]\d+(?:\.\d+)?["\s]*[NSns])[,\s]+(\d+[\u00B0\s]\d+['\s]\d+(?:\.\d+)?["\s]*[EWew])/;
  const m = s.match(dmsAll);
  if (m) {
    const lat = parseDMS(m[1]);
    const lng = parseDMS(m[2]);
    if (lat !== null && lng !== null) {
      return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
    }
  }

  return null;
}

/** Format decimal ke DMS string untuk display */
export function toDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = ((minFull - min) * 60).toFixed(3);
  const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
  return `${deg}\u00B0${min}'${sec}"${dir}`;
}
