"""
PDF Text Extractor Script (with OCR support)
=============================================
Extracts text from all PDFs in a source folder and saves each
as a .txt file with the same name in an output folder.

Supports both:
  - Text-based PDFs (direct extraction via PyMuPDF)
  - Scanned/image PDFs (OCR via pytesseract + Tesseract)

Usage:
    python scripts/load_pdf.py --input "path/to/pdfs" --output "path/to/texts"

Requires:
    pip install PyMuPDF pytesseract Pillow

    Also install Tesseract OCR:
    Download from: https://github.com/UB-Mannheim/tesseract/wiki
    After installing, update TESSERACT_PATH below if needed.
"""

import argparse
import io
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("[ERROR] PyMuPDF is not installed. Run: pip install PyMuPDF")
    sys.exit(1)

try:
    import pytesseract
    from PIL import Image
except ImportError:
    print("[ERROR] pytesseract or Pillow is not installed. Run:")
    print("   pip install pytesseract Pillow")
    sys.exit(1)

# ---- Configure Tesseract path (update if installed elsewhere) ----
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
tesseract_path = Path(TESSERACT_PATH)
if tesseract_path.exists():
    pytesseract.pytesseract.tesseract_cmd = str(tesseract_path)
else:
    print(f"[WARN] Tesseract not found at: {TESSERACT_PATH}")
    print("       Trying system PATH instead...")


def extract_text_from_pdf(pdf_path: Path) -> str:
    """
    Extract text from a PDF.
    First tries direct text extraction. If that yields nothing,
    falls back to OCR on each page rendered as an image.
    """
    doc = fitz.open(str(pdf_path))
    full_text = []

    for page_num in range(len(doc)):
        page = doc[page_num]

        # Try direct text extraction first
        text = page.get_text("text").strip()

        if text:
            full_text.append(f"--- Page {page_num + 1} ---\n{text}")
        else:
            # Fallback: render page as image and OCR it
            # Use 2x zoom for better OCR accuracy
            mat = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))

            ocr_text = pytesseract.image_to_string(img, lang="eng").strip()

            if ocr_text:
                full_text.append(f"--- Page {page_num + 1} (OCR) ---\n{ocr_text}")

    doc.close()
    return "\n\n".join(full_text)


def process_all_pdfs(input_dir: Path, output_dir: Path) -> None:
    """Find all PDFs in input_dir and save extracted text to output_dir."""

    if not input_dir.exists():
        print(f"[ERROR] Input folder not found: {input_dir}")
        print(f"        Please create it and place your PDF files inside.")
        sys.exit(1)

    pdf_files = sorted(input_dir.glob("*.pdf"))

    if not pdf_files:
        print(f"[WARN] No PDF files found in: {input_dir}")
        sys.exit(0)

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"[INPUT]  {input_dir.resolve()}")
    print(f"[OUTPUT] {output_dir.resolve()}")
    print(f"[FOUND]  {len(pdf_files)} PDF(s)")
    print("-" * 60)

    success_count = 0
    error_count = 0

    for i, pdf_path in enumerate(pdf_files, 1):
        txt_filename = pdf_path.stem + ".txt"
        txt_path = output_dir / txt_filename

        try:
            print(f"\n[{i}/{len(pdf_files)}] {pdf_path.name}")
            text = extract_text_from_pdf(pdf_path)

            if not text.strip():
                print("  -> [WARN] No text extracted even with OCR")
                error_count += 1
                continue

            txt_path.write_text(text, encoding="utf-8")
            char_count = len(text)
            print(f"  -> [OK] {txt_filename} ({char_count:,} chars)")
            success_count += 1

        except Exception as e:
            print(f"  -> [FAIL] {e}")
            error_count += 1

    print("\n" + "-" * 60)
    print(f"Done! {success_count} converted, {error_count} failed/skipped")
    print(f"Text files saved in: {output_dir.resolve()}")


if __name__ == "__main__":
    script_dir = Path(__file__).parent.parent  # backend/
    default_input = script_dir / "pdfs"
    default_output = script_dir / "extracted_texts"

    parser = argparse.ArgumentParser(
        description="Extract text from PDFs (supports scanned PDFs via OCR)"
    )
    parser.add_argument(
        "--input", "-i",
        type=Path,
        default=default_input,
        help=f"Folder containing PDF files (default: {default_input})"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=default_output,
        help=f"Folder to save extracted text files (default: {default_output})"
    )

    args = parser.parse_args()
    process_all_pdfs(args.input, args.output)
