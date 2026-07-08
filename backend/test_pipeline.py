"""
TopperBhai - Pipeline Test Script
==================================
Runs each stage independently so failures are obvious.

Usage:
    python test_pipeline.py            # run all tests
    python test_pipeline.py env        # only test env vars
    python test_pipeline.py cerebras   # only test Cerebras
    python test_pipeline.py groq       # only test Groq vision
    python test_pipeline.py full       # only test full generate endpoint
"""

import sys
import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"
PASS = "\033[92m[PASS]\033[0m"
FAIL = "\033[91m[FAIL]\033[0m"
INFO = "\033[94m[INFO]\033[0m"

# ─────────────────────────────────────────────────────────────────────────────
# TEST 1: Environment Variables
# ─────────────────────────────────────────────────────────────────────────────
def test_env():
    print("\n" + "="*60)
    print("TEST 1: Environment Variables")
    print("="*60)
    required = ["GROQ_API_KEY", "CEREBRAS_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
    all_ok = True
    for key in required:
        val = os.getenv(key)
        if val:
            print(f"  {PASS} {key} = {val[:12]}...")
        else:
            print(f"  {FAIL} {key} is MISSING")
            all_ok = False
    return all_ok


# ─────────────────────────────────────────────────────────────────────────────
# TEST 2: List Cerebras models and validate correct model name
# ─────────────────────────────────────────────────────────────────────────────
def test_cerebras_models():
    print("\n" + "="*60)
    print("TEST 2: Cerebras — List Available Models")
    print("="*60)
    from openai import OpenAI
    api_key = os.getenv("CEREBRAS_API_KEY")
    if not api_key:
        print(f"  {FAIL} CEREBRAS_API_KEY not set")
        return False

    client = OpenAI(api_key=api_key, base_url="https://api.cerebras.ai/v1")
    try:
        models = client.models.list()
        print(f"  {PASS} Connected to Cerebras. Available models:")
        for m in models.data:
            print(f"         - {m.id}")
        return True
    except Exception as e:
        print(f"  {FAIL} {e}")
        return False


# ─────────────────────────────────────────────────────────────────────────────
# TEST 3: Cerebras — Small JSON generation test
# ─────────────────────────────────────────────────────────────────────────────
def test_cerebras_generation():
    print("\n" + "="*60)
    print("TEST 3: Cerebras — JSON Generation (2 dummy MCQs)")
    print("="*60)
    from openai import OpenAI
    api_key = os.getenv("CEREBRAS_API_KEY")
    client = OpenAI(api_key=api_key, base_url="https://api.cerebras.ai/v1")

    # We'll discover the right model from the list first
    try:
        models = client.models.list()
        model_ids = [m.id for m in models.data]
        # prefer llama-3.3-70b variants
        model = next((m for m in model_ids if "70b" in m.lower()), model_ids[0])
        print(f"  {INFO} Using model: {model}")
    except Exception as e:
        print(f"  {FAIL} Could not list models: {e}")
        return None   # return None to signal "use fallback"

    prompt = (
        "Generate exactly 2 MCQ questions about family relationships.\n"
        "Return ONLY valid JSON in this format:\n"
        '{"questions": [{"id":1,"topic":"Blood Relations","question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct_answer":"A","explanation":"..."}]}'
    )
    try:
        t0 = time.time()
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        elapsed = time.time() - t0
        raw = resp.choices[0].message.content
        parsed = json.loads(raw)
        q_count = len(parsed.get("questions", []))
        print(f"  {PASS} Generated {q_count} questions in {elapsed:.1f}s")
        print(f"  {INFO} Correct model name to use: {model}")
        return model
    except json.JSONDecodeError as e:
        print(f"  {FAIL} JSON parse error: {e}")
        print(f"         Raw output: {raw[:300]}")
        return None
    except Exception as e:
        print(f"  {FAIL} {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# TEST 4: Backend health check
# ─────────────────────────────────────────────────────────────────────────────
def test_backend_health():
    print("\n" + "="*60)
    print("TEST 4: Backend — Health Check (GET /)")
    print("="*60)
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"  {PASS} Backend reachable. Status: {r.status_code}")
        return True
    except requests.ConnectionError:
        print(f"  {FAIL} Cannot reach backend at {BASE_URL}. Is it running?")
        return False


# ─────────────────────────────────────────────────────────────────────────────
# TEST 5: Full generate-paper endpoint
# ─────────────────────────────────────────────────────────────────────────────
def test_full_pipeline():
    print("\n" + "="*60)
    print("TEST 5: Full Pipeline — POST /api/v1/generate-paper")
    print("="*60)
    payload = {
        "subject_id": "aptitude",
        "topics": ["Blood Relations"],
        "challenge": "rookie",
        "question_count": 3
    }
    print(f"  {INFO} Payload: {json.dumps(payload)}")
    print(f"  {INFO} This may take 30-90 seconds (vision transcription + generation)...")
    try:
        t0 = time.time()
        r = requests.post(
            f"{BASE_URL}/api/v1/generate-paper",
            json=payload,
            timeout=180
        )
        elapsed = time.time() - t0
        if r.status_code == 200:
            data = r.json()
            q_count = data.get("question_count", 0)
            print(f"  {PASS} Success! {q_count} questions generated in {elapsed:.1f}s")
            print(f"  {INFO} Topics loaded: {data.get('topics_loaded')}")
            if data.get("questions"):
                q = data["questions"][0]
                print(f"\n  Sample Q1: {q['question'][:80]}...")
                print(f"  Options  : {list(q['options'].values())}")
                print(f"  Answer   : {q['correct_answer']}")
            return True
        else:
            print(f"  {FAIL} HTTP {r.status_code}: {r.text[:500]}")
            return False
    except requests.Timeout:
        print(f"  {FAIL} Request timed out after 180s")
        return False
    except Exception as e:
        print(f"  {FAIL} {e}")
        return False




# ─────────────────────────────────────────────────────────────────────────────
# Main runner
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "all"

    results = {}

    if arg in ("all", "env"):
        results["env"] = test_env()

    if arg in ("all", "cerebras"):
        results["cerebras_models"] = test_cerebras_models()
        correct_model = test_cerebras_generation()
        results["cerebras_gen"] = correct_model is not None
        if correct_model:
            print(f"\n  *** Correct Cerebras model name: '{correct_model}' ***")

    if arg in ("all", "groq"):
        # Just validate Groq key is usable (list models)
        print("\n" + "="*60)
        print("TEST: Groq — API Key Validation")
        print("="*60)
        from groq import Groq
        try:
            g = Groq(api_key=os.getenv("GROQ_API_KEY"))
            models = g.models.list()
            vision_models = [m.id for m in models.data if "vision" in m.id.lower() or "scout" in m.id.lower()]
            print(f"  {PASS} Groq connected. Vision-capable models:")
            for m in vision_models:
                print(f"         - {m}")
            results["groq"] = True
        except Exception as e:
            print(f"  {FAIL} {e}")
            results["groq"] = False

    if arg in ("all", "full"):
        if not test_backend_health():
            print(f"\n  Skipping full pipeline test — backend not running.")
        else:
            results["full"] = test_full_pipeline()

    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for k, v in results.items():
        status = PASS if v else FAIL
        print(f"  {status} {k}")
    print()

