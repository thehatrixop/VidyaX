import sys
import os
import fitz  # PyMuPDF
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from db.supabase_client import supabase

STORAGE_BUCKET = "Notes"
DATASET_DIR = backend_dir.parent / "dataset"

SUBJECTS_MAPPING = {
    "Algorithms": {
        "name": "Algorithms",
        "slug": "algorithms",
        "code": "ALGO",
        "description": "Asymptotic Analysis, Sorting, Searching, Greedy, Dynamic Programming, Graphs",
        "bucket_folder": "Algorithms",
        "files_filter": None
    },
    "CN": {
        "name": "Computer Networks",
        "slug": "computer-networks",
        "code": "CN",
        "description": "OSI/TCP-IP Stack, Routing, IP Addressing, TCP/UDP, Application Protocols",
        "bucket_folder": "Computer Network",
        "files_filter": None
    },
    "COA": {
        "name": "COA",
        "slug": "coa",
        "code": "COA",
        "description": "Instructions, Addressing Modes, ALU, Control Design, Pipelining, Memory Hierarchy",
        "bucket_folder": "Computer Organization and Architecture",
        "files_filter": None
    },
    "Compiler_Design": {
        "name": "Compiler Design",
        "slug": "compiler-design",
        "code": "CD",
        "description": "Lexical Analysis, Parsing, SDT, Intermediate Code, Runtime Environments, Optimization",
        "bucket_folder": "Compiler Design",
        "files_filter": None
    },
    "DBMS": {
        "name": "DBMS",
        "slug": "dbms",
        "code": "DBMS",
        "description": "ER Model, Relational Algebra, SQL, Normalization, Transactions & Concurrency, Indexing",
        "bucket_folder": "DBMS",
        "files_filter": None
    },
    "Digital_Logic": {
        "name": "Digital Logic",
        "slug": "digital-logic",
        "code": "DL",
        "description": "Boolean Algebra, K-Maps, Combinational & Sequential Circuits, Counters, Number Systems",
        "bucket_folder": "Digital Logic",
        "files_filter": None
    },
    "Discrete_Maths": {
        "name": "Discrete Mathematics",
        "slug": "discrete-mathematics",
        "code": "DM",
        "description": "Logic, Sets, Relations, Functions, Group Theory, Combinatorics, Graph Theory",
        "bucket_folder": "Discrete Maths",
        "files_filter": None
    },
    "Engineering_Maths": {
        "name": "Engineering Mathematics",
        "slug": "engineering-mathematics",
        "code": "EM",
        "description": "Linear Algebra, Calculus, Integration, Probability, Random Variables & Expectations",
        "bucket_folder": "Engineering Maths",
        "files_filter": None
    },
    "OS": {
        "name": "Operating Systems",
        "slug": "operating-systems",
        "code": "OS",
        "description": "Processes, CPU Scheduling, Synchronization, Deadlocks, Memory Management, File Systems",
        "bucket_folder": "Operating System",
        "files_filter": None
    },
    "TOC": {
        "name": "TOC",
        "slug": "toc",
        "code": "TOC",
        "description": "Finite Automata, Regular Grammars, Context-Free Languages, PDA, Turing Machines",
        "bucket_folder": "Theory of Computation",
        "files_filter": None
    },
    "Programming_and_DS_CPROG": {
        "dataset_folder": "Programming_and_DS",
        "name": "C Programming Basics",
        "slug": "c-programming",
        "code": "CPROG",
        "description": "Variables, Operators, Control Statements, Pointers, Arrays, Structures, Recursion",
        "bucket_folder": "Programming and DS",
        "files_filter": [
            "Data Types and Operators.pdf",
            "Control Flow Statements.pdf",
            "Arrays and Pointers.pdf",
            "Storage Classes and Functions.pdf",
            "Strings.pdf"
        ]
    },
    "Programming_and_DS_DS": {
        "dataset_folder": "Programming_and_DS",
        "name": "Data Structures",
        "slug": "data-structures",
        "code": "DS",
        "description": "Stacks, Queues, Linked Lists, Trees, BSTs, Heaps, Graphs, Hashing",
        "bucket_folder": "Programming and DS",
        "files_filter": [
            "Arrays and Linked Lists.pdf",
            "Stacks and Queues.pdf",
            "Trees Binary Trees and BST.pdf",
            "Graph Traversal BFS and DFS.pdf",
            "Hashing.pdf"
        ]
    }
}


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract text from a PDF page by page using PyMuPDF (fitz)."""
    doc = fitz.open(str(pdf_path))
    full_text = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text").strip()
        if text:
            full_text.append(f"--- Page {page_num + 1} ---\n{text}")
    doc.close()
    return "\n\n".join(full_text)


def main():
    print("=== Starting Dataset Synchronization to Supabase ===")
    print(f"Dataset directory: {DATASET_DIR.resolve()}")
    
    # 1. Fetch existing subjects from DB
    print("[1/5] Fetching existing subjects...")
    subjects_res = supabase.table("subjects").select("id, slug, name").execute()
    db_subjects = {s["slug"]: s for s in subjects_res.data}
    print(f"      Found {len(db_subjects)} subject(s) in DB.")

    # 2. Fetch existing topics from DB
    print("[2/5] Fetching existing topics...")
    topics_res = supabase.table("topics").select("id, subject_id, name, notes_url").execute()
    db_topics = {t["notes_url"].lower(): t for t in topics_res.data if t.get("notes_url")}
    print(f"      Found {len(db_topics)} topic(s) with notes_url in DB.")

    # 3. Create cache of bucket files to avoid redundant network listings
    print("[3/5] Listing files in Storage Bucket 'Notes'...")
    bucket_files_by_folder = {}
    
    # Identify all unique bucket folders to scan
    bucket_folders = set(sub["bucket_folder"] for sub in SUBJECTS_MAPPING.values())
    for folder in bucket_folders:
        try:
            files = supabase.storage.from_(STORAGE_BUCKET).list(folder)
            bucket_files_by_folder[folder.lower()] = {f["name"].lower(): f["name"] for f in files}
            print(f"      Storage folder '{folder}': {len(files)} file(s) found.")
        except Exception as e:
            bucket_files_by_folder[folder.lower()] = {}
            print(f"      Warning listing storage folder '{folder}': {e}")

    # 4. Synchronize each subject and its topics
    print("\n[4/5] Synchronizing subjects and topics...")
    
    for mapping_key, sub_info in SUBJECTS_MAPPING.items():
        sub_name = sub_info["name"]
        sub_slug = sub_info["slug"]
        sub_code = sub_info["code"]
        sub_desc = sub_info["description"]
        bucket_folder = sub_info["bucket_folder"]
        
        # Determine dataset source folder name
        dataset_folder_name = sub_info.get("dataset_folder", mapping_key)
        local_folder = DATASET_DIR / dataset_folder_name
        
        if not local_folder.exists():
            print(f"[WARN] Local dataset directory does not exist: {local_folder}")
            continue

        print(f"\n--- Processing Subject: {sub_name} (slug: {sub_slug}) ---")
        
        # Check/Insert Subject
        subject_id = None
        if sub_slug in db_subjects:
            subject_id = db_subjects[sub_slug]["id"]
            print(f"  [OK] Subject exists in DB: '{sub_name}' (ID: {subject_id})")
        else:
            print(f"  [NEW] Subject missing in DB. Inserting '{sub_name}'...")
            try:
                ins_res = supabase.table("subjects").insert({
                    "name": sub_name,
                    "slug": sub_slug,
                    "code": sub_code,
                    "description": sub_desc
                }).execute()
                if ins_res.data:
                    subject_id = ins_res.data[0]["id"]
                    print(f"    -> Inserted successfully! Assigned ID: {subject_id}")
                    # Update local cache
                    db_subjects[sub_slug] = ins_res.data[0]
                else:
                    raise Exception("Insertion returned no data")
            except Exception as e:
                print(f"  [ERROR] Failed to insert subject {sub_name}: {e}")
                continue

        # Get local PDF files to process
        pdf_files = sorted(local_folder.glob("*.pdf"))
        files_filter = sub_info["files_filter"]
        
        if files_filter is not None:
            # Filter files belonging to this split subject (e.g. c-programming vs data-structures)
            pdf_files = [f for f in pdf_files if f.name in files_filter]
        
        print(f"  Found {len(pdf_files)} PDF(s) to check.")

        # Process each PDF
        for pdf_path in pdf_files:
            filename = pdf_path.name
            topic_name = pdf_path.stem  # Use name without extension as topic name
            
            # Storage Bucket path: e.g. "Algorithms/Basics of Algorithms and Asymptotic Notations.pdf"
            bucket_path = f"{bucket_folder}/{filename}"
            bucket_path_lower = bucket_path.lower()
            
            # A. Check/Upload to Supabase Storage Bucket
            storage_folder_lower = bucket_folder.lower()
            filename_lower = filename.lower()
            
            storage_files = bucket_files_by_folder.get(storage_folder_lower, {})
            
            if filename_lower in storage_files:
                print(f"    [{filename}] -> [OK] Present in storage bucket.")
            else:
                print(f"    [{filename}] -> [NEW] Uploading to storage bucket '{STORAGE_BUCKET}/{bucket_folder}'...")
                try:
                    with open(pdf_path, "rb") as f:
                        file_data = f.read()
                    
                    supabase.storage.from_(STORAGE_BUCKET).upload(
                        path=bucket_path,
                        file=file_data,
                        file_options={"content-type": "application/pdf"}
                    )
                    print(f"      -> Uploaded successfully!")
                    storage_files[filename_lower] = filename
                except Exception as e:
                    print(f"      [ERROR] Upload failed for {filename}: {e}")
                    # Continue anyway, we might still insert database record if needed

            # B. Check/Insert into `topics` table
            notes_url = bucket_path
            notes_url_lower = notes_url.lower()
            
            topic_id = None
            if notes_url_lower in db_topics:
                topic_id = db_topics[notes_url_lower]["id"]
                print(f"    [{filename}] -> [OK] Topic exists in DB: '{topic_name}' (ID: {topic_id})")
            else:
                print(f"    [{filename}] -> [NEW] Topic missing in DB. Inserting '{topic_name}'...")
                try:
                    ins_res = supabase.table("topics").insert({
                        "subject_id": subject_id,
                        "name": topic_name,
                        "notes_url": notes_url
                    }).execute()
                    if ins_res.data:
                        topic_id = ins_res.data[0]["id"]
                        print(f"      -> Inserted topic successfully! Assigned ID: {topic_id}")
                        db_topics[notes_url_lower] = ins_res.data[0]
                    else:
                        raise Exception("Topic insertion returned no data")
                except Exception as e:
                    print(f"      [ERROR] Failed to insert topic {topic_name}: {e}")
                    continue

            # C. Check/Insert into `topic_content` table
            try:
                # Query topic content for this topic
                content_res = supabase.table("topic_content").select("id").eq("topic_id", topic_id).execute()
                if content_res.data:
                    print(f"    [{filename}] -> [OK] Content exists in `topic_content` table.")
                else:
                    print(f"    [{filename}] -> [NEW] Content missing. Extracting text and inserting...")
                    text_content = extract_text_from_pdf(pdf_path)
                    word_count = len(text_content.split())
                    
                    if not text_content.strip():
                        print("      [WARN] Extracted text is empty. Skipping insertion.")
                        continue
                        
                    supabase.table("topic_content").insert({
                        "topic_id": topic_id,
                        "content": text_content,
                        "word_count": word_count,
                        "source_pdf": filename
                    }).execute()
                    print(f"      -> Extracted and saved {word_count} words to database.")
            except Exception as e:
                print(f"      [ERROR] Failed to process content for {topic_name}: {e}")

    print("\n=== Dataset Synchronization Completed! ===")


if __name__ == "__main__":
    main()
