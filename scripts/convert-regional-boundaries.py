"""Convert the regional KMZ source files to lightweight GeoJSON layers.

Each source polygon is preserved, while geometry is simplified in degrees (about
5.5 m at this latitude) and properties are reduced to the zone name. Run with:
    python scripts/convert-regional-boundaries.py
"""
from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from shapely.geometry import Polygon, mapping

ROOT = Path(__file__).resolve().parent.parent
SOURCES = {
    "kabupaten-malang": "Kab. Malang.kmz",
    "kabupaten-pasuruan": "Kab. Pasuruan.kmz",
    "kota-pasuruan": "Kota. Pasuruan.kmz",
    "kota-surabaya": "Kota Surabaya.kmz",
    "kabupaten-sidoarjo": "Kab. Sidoarjo.kmz",
}
OUTPUT_DIR = ROOT / "public" / "boundaries"
NS = {"k": "http://www.opengis.net/kml/2.2"}
SIMPLIFY_TOLERANCE = 0.00005


def coordinates(text: str | None) -> list[tuple[float, float]]:
    if not text:
        return []
    points = []
    for pair in text.split():
        values = pair.split(",")
        if len(values) < 2:
            continue
        try:
            points.append((round(float(values[0]), 6), round(float(values[1]), 6)))
        except ValueError:
            continue
    return points


def zone_name(placemark: ET.Element) -> str:
    name = (placemark.findtext("k:name", default="", namespaces=NS) or "").strip()
    description = placemark.findtext("k:description", default="", namespaces=NS) or ""
    match = re.search(r"(?:NAMOBJ|NAMA)\s*</td>\s*<td[^>]*>\s*([^<]+)", description, re.I)
    return (match.group(1).strip() if match else name) or "Tanpa nama"


def polygons(placemark: ET.Element):
    for polygon in placemark.findall(".//k:Polygon", NS):
        outer_node = polygon.find(".//k:outerBoundaryIs/k:LinearRing/k:coordinates", NS)
        outer = coordinates(outer_node.text if outer_node is not None else None)
        if len(outer) < 4:
            continue
        holes = []
        for inner_node in polygon.findall(".//k:innerBoundaryIs/k:LinearRing/k:coordinates", NS):
            ring = coordinates(inner_node.text)
            if len(ring) >= 4:
                holes.append(ring)
        try:
            shape = Polygon(outer, holes).buffer(0)
            if shape.is_empty:
                continue
            simplified = shape.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True)
            if simplified.is_empty:
                continue
            if simplified.geom_type == "Polygon":
                yield simplified
            elif simplified.geom_type == "MultiPolygon":
                yield from simplified.geoms
        except (ValueError, TypeError):
            continue


def convert(slug: str, filename: str) -> None:
    source = ROOT / "docs" / filename
    with zipfile.ZipFile(source) as archive:
        root = ET.fromstring(archive.read("doc.kml"))

    features = []
    for placemark in root.findall(".//k:Placemark", NS):
        zone = zone_name(placemark)
        for shape in polygons(placemark):
            features.append({
                "type": "Feature",
                "properties": {"zone": zone},
                "geometry": mapping(shape),
            })

    output = OUTPUT_DIR / f"{slug}.geojson"
    output.write_text(json.dumps({
        "type": "FeatureCollection",
        "name": slug.replace("-", " ").title(),
        "features": features,
    }, separators=(",", ":")), encoding="utf-8")
    print(f"{filename}: {len(features):,} features -> {output.relative_to(ROOT)} ({output.stat().st_size / 1024 / 1024:.2f} MB)")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for slug, filename in SOURCES.items():
        convert(slug, filename)


if __name__ == "__main__":
    main()
