"""
inspect_extraction.py
---------------------
Tests Groq Vision transcription on a single PDF page.
Downloads from Supabase, renders page 1 as image, sends to Groq Vision.

Run from the backend/ directory:
    python inspect_extraction.py

Change NOTES_URL or PAGE_NUM to test different PDFs/pages.
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import fitz
import io
import base64
import time
from dotenv import load_dotenv
from groq import Groq
from db.supabase_client import supabase

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
BUCKET    = "Notes"
NOTES_URL = "aptitude/Blood Relations.pdf"   # ← change to test other PDFs
PAGE_NUM  = 1                                # ← page to inspect (1-indexed)
OUTPUT    = "extracted_output.txt"
MODEL     = "meta-llama/llama-4-scout-17b-16e-instruct"
# ─────────────────────────────────────────────────────────────────────────────

def main():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        print("ERROR: Set GROQ_API_KEY in backend/.env first!")
        return

    client = Groq(api_key=api_key)

    print(f"Downloading: {NOTES_URL} ...")
    pdf_bytes = supabase.storage.from_(BUCKET).download(NOTES_URL)
    print(f"Downloaded {len(pdf_bytes):,} bytes")

    doc = fitz.open(stream=io.BytesIO(pdf_bytes), filetype="pdf")
    total_pages = doc.page_count
    print(f"Total pages: {total_pages}")

    page_idx = min(PAGE_NUM - 1, total_pages - 1)
    page = doc[page_idx]

    print(f"\nRendering page {PAGE_NUM} as image...")
    mat = fitz.Matrix(2.0, 2.0)
    pix = page.get_pixmap(matrix=mat)
    img_bytes = pix.tobytes("png")
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")
    print(f"Image size: {len(img_bytes):,} bytes ({pix.width}x{pix.height}px)")

    doc.close()

    print(f"\nSending to Groq Vision ({MODEL})...")
    t0 = time.time()

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{img_b64}"},
                    },
                    {
                        "type": "text",
                        "text": (
                            "You are a precise document transcription assistant. "
                            "Transcribe ALL content from this page exactly as it appears. "
                            "Include: all text, headings, subheadings, bullet points, numbered lists, "
                            "tables (format as markdown), mathematical formulas, and describe any diagrams "
                            "or figures in detail. Preserve the logical reading order."
                        )
                    }
                ],
            }
        ],
        max_tokens=4096,
    )

    elapsed = time.time() - t0
    result = response.choices[0].message.content.strip()

    print(f"Done in {elapsed:.1f}s — {len(result):,} chars\n")
    print("=" * 60)
    print(result)
    print("=" * 60)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(f"Source : {NOTES_URL} (page {PAGE_NUM})\n")
        f.write(f"Model  : {MODEL}\n")
        f.write(f"Time   : {elapsed:.1f}s\n")
        f.write(f"Chars  : {len(result):,}\n\n")
        f.write("=" * 60 + "\n\n")
        f.write(result)

    print(f"\nFull output saved to: {os.path.abspath(OUTPUT)}")


if __name__ == "__main__":
    main()
