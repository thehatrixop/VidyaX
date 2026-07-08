"""
fix_notes_url.py
----------------
Repairs case-mismatches between the `notes_url` column in the `topics` table
and the actual filenames stored in Supabase Storage bucket "Notes".

Run from the backend/ directory:
    python fix_notes_url.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from db.supabase_client import supabase

BUCKET = "Notes"

def main():
    # 1. List every file actually stored in the bucket
    result = supabase.storage.from_(BUCKET).list("aptitude")
    if not result:
        print("No files found in bucket 'Notes/aptitude'. Check bucket name.")
        return

    # Build a map:  lowercase_filename -> real_filename
    # e.g.  "percentages.pdf" -> "Percentages.pdf"
    storage_files = {f["name"].lower(): f["name"] for f in result}
    print("Files in bucket (aptitude/):")
    for real in sorted(storage_files.values()):
        print(f"  {real}")

    # 2. Fetch all topic rows that have a notes_url
    topics = supabase.table("topics").select("id,name,notes_url").execute()
    if not topics.data:
        print("No topics found in database.")
        return

    print(f"\nChecking {len(topics.data)} topics...")
    fixed = 0

    for topic in topics.data:
        raw_url = topic.get("notes_url")
        if not raw_url:
            continue

        # notes_url is like "aptitude/Blood Relations.pdf"
        # Split into folder + filename
        parts = raw_url.split("/", 1)
        if len(parts) != 2:
            print(f"  [SKIP] Unexpected url format: {raw_url}")
            continue

        folder, filename = parts
        correct_filename = storage_files.get(filename.lower())

        if correct_filename is None:
            print(f"  [MISSING] '{raw_url}' -> file not found in bucket at all")
            continue

        correct_url = f"{folder}/{correct_filename}"

        if raw_url == correct_url:
            print(f"  [OK]    {topic['name']} -> {raw_url}")
        else:
            print(f"  [FIX]   {topic['name']}: '{raw_url}' -> '{correct_url}'")
            supabase.table("topics").update({"notes_url": correct_url}).eq("id", topic["id"]).execute()
            fixed += 1

    print(f"\nDone. Fixed {fixed} record(s).")

if __name__ == "__main__":
    main()
