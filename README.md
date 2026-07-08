# 🎓 VidyaX — AI-First GATE CS Learning Platform

VidyaX is a state-of-the-art, AI-first study companion and learning platform tailor-made for GATE Computer Science aspirants. It integrates powerful language and vision models with a highly responsive, modern, and aesthetically premium user interface to help students learn, practice, and resolve doubts dynamically.

---

## 🏗️ Tech Stack

VidyaX is structured as a decoupled web application with a FastAPI backend and a Next.js frontend:

*   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion (premium fluid micro-animations), Lucide React (icons), and KaTeX (LaTeX math rendering).
*   **Backend**: Python 3, FastAPI, Supabase (PostgreSQL client & Storage), PyMuPDF (PDF parsing), Groq Cloud API (Vision/OCR), Cerebras API (ultra-fast MCQ generation & text analysis), and Slowapi (rate limiting).
*   **Database & Storage**: Supabase PostgreSQL and Supabase Storage.

---

## ✨ Core Features

### 📝 1. MCQ Practice Paper Generator
A fully automated pipeline that generates custom MCQ practice exams based on syllabus PDF notes.
*   **Automated RAG**: Extracts content from local or stored PDFs (with Groq Vision OCR fallback for scanned documents).
*   **Context-Aware Generation**: Sends text context to the Cerebras API (`gpt-oss-120b`) to formulate high-quality, GATE-standard multiple-choice questions.
*   **Self-Healing Parser**: Uses a progressive repair algorithm to handle and fix truncated or malformed JSON payloads from the AI model.
*   **Exam Interface**: Live stopwatch controls, interactive option selections, print layouts, and expandable step-by-step solutions.

### 💬 2. TopperBhai AI Tutor (Mistake Analysis)
*   When a student makes a mistake during practice, they can click to launch an inline chat module (**TopperBhai AI Tutor**).
*   The AI tutor compares the student's selected incorrect answer with the correct answer and the official explanation, guiding the student to understand the underlying concept using a friendly, motivational mentoring tone.

### 🎥 3. Concept Dojo (AI Video Recommendations)
*   Accepts educational queries from the student.
*   Uses AI to filter out non-academic requests (with Hinglish motivational responses for off-topic questions).
*   Formulates optimized YouTube search queries, retrieves video results, and scores them using AI, presenting the top 5 most relevant video explanations with inline player embeds.

### ⏱️ 4. Focus Dojo (Custom Pomodoro Timer)
*   An interactive, visual Pomodoro study timer with Web Audio API chime sounds, customizable session lengths, and rotating motivational quotes to keep students on track.

### ✍️ 5. Scribe Dojo (TopperBhai Grammar Coach)
*   A writing lab designed to evaluate study drafts, summaries, and answers.
*   Performs structural analysis, provides inline grammatical rule corrections, highlights text diffs, and offers interactive follow-up coaching chat.

### 📋 6. Task Quest (Study Kanban Board)
*   A Gamified Kanban project board allowing students to track progress on their study topics. Supports custom study alerts, due dates, and local storage state persistence.

---

## 📁 Repository Structure

```
VidyaX-main/
├── FrontEnd/                  # Next.js App Router Frontend
│   ├── app/                   # App routes (layout, homepage, features, subjects)
│   ├── components/            # Shared UI elements (vidyax-ui, LatexRenderer, etc.)
│   ├── lib/                   # Utility helpers and API clients
│   ├── public/                # Static assets (images, fonts, sounds)
│   └── package.json           # Frontend dependency declarations
├── backend/                   # FastAPI Backend
│   ├── db/                    # Supabase client and rate limiter config
│   ├── models/                # Pydantic request & validation models
│   ├── routers/               # Endpoint modules (chat, generate, grammar, etc.)
│   ├── scripts/               # CLI migration, sync, and OCR utilities
│   ├── main.py                # FastAPI entrypoint
│   └── requirements.txt       # Backend Python dependencies
├── dataset/                   # Local syllabus PDFs & notes
└── brain.md                   # Repository knowledge base
```

---

## 🚀 Setup & Installation

### Prerequisite Environment Variables
Before running the application, make sure to configure these secrets.

#### Backend Env (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
CEREBRAS_API_KEY=your_cerebras_api_key
ALLOWED_ORIGINS=http://localhost:3000
```

#### Frontend Env (`FrontEnd/.env.local`)
Create a `.env.local` file in the `FrontEnd/` directory (optional - defaults to localhost:8000):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 1. Running the FastAPI Backend

1.  **Navigate to the backend directory**:
    ```powershell
    cd backend
    ```
2.  **Create and activate a virtual environment** (recommended):
    ```powershell
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3.  **Install dependencies**:
    ```powershell
    pip install -r requirements.txt
    ```
4.  **Start the server**:
    ```powershell
    uvicorn main:app --reload --port 8000
    ```
    The API docs will be available at `http://localhost:8000/docs`.

---

### 2. Running the Next.js Frontend

1.  **Navigate to the frontend directory**:
    ```powershell
    cd FrontEnd
    ```
2.  **Install dependencies** using `pnpm`:
    ```powershell
    pnpm install
    ```
3.  **Start the development server**:
    ```powershell
    pnpm dev
    ```
    Open `http://localhost:3000` to view the application in your browser.

---

## ⚙️ CLI Scripts & Admin Tools

The backend contains several administration scripts to help sync data:

1.  **Sync Syllabus PDFs to Supabase**:
    Scans the `dataset/` directory, uploads PDFs to the Supabase storage bucket `Notes`, updates database tables (`subjects` & `topics`), and extracts raw text into the database for rapid generation.
    ```powershell
    python backend/scripts/sync_dataset.py
    ```
2.  **Test PDF OCR / Vision Extraction**:
    Tests Groq Vision OCR transcription on a specific PDF page.
    ```powershell
    python backend/inspect_extraction.py
    ```
3.  **Fix Notes Storage URLs**:
    Matches and fixes capitalization discrepancies between database rows and Supabase Storage paths.
    ```powershell
    python backend/fix_notes_url.py
    ```

---

## 🔑 License Activation
To unlock the **Pro tier** (which grants access to advanced difficulty settings and premium features):
*   Add a local storage key in your browser starting with `vx_` (e.g., `vx_topper_key`).
*   Alternatively, go to the `/pricing` page in the app and input a valid activation key.
