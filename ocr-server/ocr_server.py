"""
OCR Coordinate Extraction Server
=================================
Python + Tesseract + OpenCV untuk scanning koordinat dari foto GPS Camera.
Pre-processing gambar (grayscale, threshold, denoise) untuk akurasi tinggi.

Jalankan: python ocr_server.py
Endpoint: POST http://localhost:5050/ocr  (multipart/form-data, field: "photos")
"""

import os
import sys
import re
import io
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
import pytesseract
from flask import Flask, request, jsonify
from flask_cors import CORS

# ─── Tesseract path auto-detect ───────────────────────────────────────────────

TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    r"C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe".format(os.getenv("USERNAME", "")),
]

def find_tesseract():
    for p in TESSERACT_PATHS:
        if os.path.isfile(p):
            return p
    # Try system PATH
    import shutil
    found = shutil.which("tesseract")
    if found:
        return found
    return None

tess_path = find_tesseract()
if tess_path:
    pytesseract.pytesseract.tesseract_cmd = tess_path
    print(f"[OK] Tesseract ditemukan: {tess_path}")
else:
    print("[WARN] Tesseract tidak ditemukan. Install dulu: winget install UB-Mannheim.TesseractOCR")
    print("       Atau download dari: https://github.com/UB-Mannheim/tesseract/wiki")

# ─── Image preprocessing ─────────────────────────────────────────────────────

def preprocess_for_ocr(img_array: np.ndarray) -> np.ndarray:
    """
    Pre-processing gambar untuk OCR akurat:
    1. Convert ke grayscale
    2. Resize jika terlalu kecil
    3. Adaptive threshold untuk kontras tinggi
    4. Denoise
    5. Dilate sedikit untuk memperjelas teks
    """
    # Grayscale
    if len(img_array.shape) == 3:
        gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
    else:
        gray = img_array.copy()

    # Resize jika kecil — OCR butuh min ~300 DPI effective
    h, w = gray.shape
    if max(h, w) < 1000:
        scale = 1500 / max(h, w)
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    # CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # Denoise
    gray = cv2.fastNlMeansDenoising(gray, h=10)

    # Adaptive threshold — handles varying lighting on watermarks
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 10
    )

    # Light morphological operations to clean up noise
    kernel = np.ones((2, 2), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    return thresh


def crop_regions(img: np.ndarray):
    """
    Crop beberapa region dari gambar untuk scanning bertahap.
    Returns list of (region_name, cropped_image).
    """
    h, w = img.shape[:2]
    regions = []

    # 1. Bottom-right (paling umum untuk GPS Camera watermark)
    br_y = int(h * 0.55)
    br_x = int(w * 0.4)
    regions.append(("bottom-right", img[br_y:, br_x:]))

    # 2. Bottom 35%
    b_y = int(h * 0.65)
    regions.append(("bottom", img[b_y:, :]))

    # 3. Right 50%
    r_x = int(w * 0.5)
    regions.append(("right", img[:, r_x:]))

    # 4. Top 30% (some cameras put watermark on top)
    t_h = int(h * 0.35)
    regions.append(("top", img[:t_h, :]))

    # 5. Full image (fallback)
    regions.append(("full", img))

    return regions


# ─── GPS parsing ──────────────────────────────────────────────────────────────

def parse_gps_from_text(text: str):
    """
    Parse GPS coordinates dari teks OCR.
    Handles banyak format GPS Camera watermark.
    """
    # Common OCR corrections
    clean = text
    clean = re.sub(r'[oO](?=\d)', '0', clean)  # O before digit → 0
    clean = re.sub(r'(?<=\d)[oO]', '0', clean)  # O after digit → 0
    clean = clean.replace('l', '1').replace('I', '1').replace('|', '1')

    patterns = [
        # Pattern A: 8.3861656S 112.77328952E
        (r'(\d+[.,]\d{3,})\s*([NSns])\s+(\d+[.,]\d{3,})\s*([EWew])', 'decimal_dir'),
        # Pattern B: S8.386 E112.773
        (r'([NSns])\s*(\d+[.,]\d{3,})\s+([EWew])\s*(\d+[.,]\d{3,})', 'dir_decimal'),
        # Pattern C: -8.386165, 112.773289
        (r'(-?\d+[.,]\d{4,})\s*[,\s]\s*(-?\d+[.,]\d{4,})', 'signed'),
        # Pattern D: DMS — 8°23'10.2"S 112°46'23.8"E
        (r'(\d{1,3})\s*[°ºo]\s*(\d{1,2})\s*[\'\'′]\s*([\d.,]+)\s*[\"\"″]?\s*([NSns])\s+(\d{1,3})\s*[°ºo]\s*(\d{1,2})\s*[\'\'′]\s*([\d.,]+)\s*[\"\"″]?\s*([EWew])', 'dms'),
        # Pattern E: shorter decimal (3+ digits)
        (r'(-?\d+[.,]\d{3,})\s*[,\s]\s*(-?\d+[.,]\d{3,})', 'signed_short'),
        # Pattern F: Lat: -8.386 Lon: 112.773
        (r'[Ll]at[:\s]*(-?\d+[.,]\d{3,})\s*[,\s]*[Ll](?:on|ng)[:\s]*(-?\d+[.,]\d{3,})', 'labeled'),
    ]

    for pattern, ptype in patterns:
        m = re.search(pattern, clean)
        if not m:
            continue

        lat, lng = None, None

        if ptype == 'decimal_dir':
            lat = float(m.group(1).replace(',', '.'))
            lng = float(m.group(3).replace(',', '.'))
            if m.group(2).upper() == 'S': lat = -lat
            if m.group(4).upper() == 'W': lng = -lng

        elif ptype == 'dir_decimal':
            lat = float(m.group(2).replace(',', '.'))
            lng = float(m.group(4).replace(',', '.'))
            if m.group(1).upper() == 'S': lat = -lat
            if m.group(3).upper() == 'W': lng = -lng

        elif ptype in ('signed', 'signed_short'):
            lat = float(m.group(1).replace(',', '.'))
            lng = float(m.group(2).replace(',', '.'))

        elif ptype == 'dms':
            lat = int(m.group(1)) + int(m.group(2)) / 60 + float(m.group(3).replace(',', '.')) / 3600
            lng = int(m.group(5)) + int(m.group(6)) / 60 + float(m.group(7).replace(',', '.')) / 3600
            if m.group(4).upper() == 'S': lat = -lat
            if m.group(8).upper() == 'W': lng = -lng

        elif ptype == 'labeled':
            lat = float(m.group(1).replace(',', '.'))
            lng = float(m.group(2).replace(',', '.'))

        if lat is not None and lng is not None:
            # Sanity check — valid GPS range
            if -90 <= lat <= 90 and -180 <= lng <= 180:
                return {"lat": round(lat, 6), "lng": round(lng, 6)}

    return None


def extract_datetime_from_text(text: str):
    """Extract date/time from OCR text."""
    # Try: 15 Jan 2025 08:30
    m = re.search(r'(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*(\d{4})\s+(\d{1,2}):(\d{2})', text, re.IGNORECASE)
    if m:
        return f"{m.group(4).zfill(2)}:{m.group(5)}"
    # Try: 2025-01-15 08:30
    m = re.search(r'(\d{4})[/-](\d{2})[/-](\d{2})\s+(\d{1,2}):(\d{2})', text)
    if m:
        return f"{m.group(4).zfill(2)}:{m.group(5)}"
    return ""


# ─── Main OCR function ───────────────────────────────────────────────────────

def ocr_extract_gps(image_bytes: bytes, filename: str = ""):
    """
    Extract GPS coordinates from image using OpenCV preprocessing + Tesseract OCR.
    Returns dict with lat, lng, waktu, source, raw_text or None.
    """
    # Load image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"error": "Gagal membaca gambar", "filename": filename}

    regions = crop_regions(img)

    for region_name, region_img in regions:
        # Preprocess
        processed = preprocess_for_ocr(region_img)

        # OCR with multiple PSM modes for better accuracy
        for psm in [6, 3, 11]:  # 6=block, 3=auto, 11=sparse
            try:
                config = f'--oem 3 --psm {psm} -c tessedit_char_whitelist=0123456789.-,NSEWnsew°\'\"° '
                text = pytesseract.image_to_string(processed, config=config)

                # Also try without char whitelist for more general recognition
                if not parse_gps_from_text(text):
                    text = pytesseract.image_to_string(processed, config=f'--oem 3 --psm {psm}')

                gps = parse_gps_from_text(text)
                if gps:
                    waktu = extract_datetime_from_text(text)
                    return {
                        "lat": str(gps["lat"]),
                        "lng": str(gps["lng"]),
                        "waktu": waktu,
                        "source": f"ocr-python ({region_name})",
                        "raw_text": text.strip()[:200],
                        "filename": filename,
                    }
            except Exception as e:
                continue

    return {"error": "Koordinat tidak ditemukan", "filename": filename, "raw_text": ""}


# ─── Flask API ────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, origins=["http://localhost:*", "http://127.0.0.1:*"])

# Batas abuse: total body maks 25MB dan maks 12 foto per request.
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024
MAX_FILES_PER_REQUEST = 12


@app.route("/ocr", methods=["POST"])
def ocr_endpoint():
    """
    POST /ocr — batch OCR koordinat dari foto.
    Form field: "photos" (file upload, bisa multiple)
    Returns JSON array of results.
    """
    files = request.files.getlist("photos")
    if not files:
        return jsonify({"error": "Tidak ada file yang dikirim"}), 400
    if len(files) > MAX_FILES_PER_REQUEST:
        return jsonify({"error": f"Maksimal {MAX_FILES_PER_REQUEST} file per request"}), 400

    results = []
    for f in files:
        try:
            image_bytes = f.read()
            result = ocr_extract_gps(image_bytes, f.filename or "unknown")
            results.append(result)
        except Exception as e:
            results.append({"error": str(e), "filename": f.filename or "unknown"})

    return jsonify(results)


@app.route("/health", methods=["GET"])
def health():
    """Health check — juga cek apakah Tesseract tersedia."""
    tess_ok = False
    tess_version = ""
    try:
        tess_version = pytesseract.get_tesseract_version().public
        tess_ok = True
    except Exception:
        pass

    return jsonify({
        "status": "ok",
        "tesseract": tess_ok,
        "tesseract_version": tess_version,
        "tesseract_path": pytesseract.pytesseract.tesseract_cmd,
    })


if __name__ == "__main__":
    print("=" * 60)
    print("  OCR Coordinate Server — ID-MAP")
    print("  Endpoint: POST http://localhost:5050/ocr")
    print("  Health:   GET  http://localhost:5050/health")
    print("=" * 60)
    # Loopback saja — companion lokal untuk browser di mesin yang sama,
    # jangan ekspos ke jaringan karena endpoint ini tanpa autentikasi.
    app.run(host="127.0.0.1", port=5050, debug=False)
