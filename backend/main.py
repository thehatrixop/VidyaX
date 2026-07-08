from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.subjects import router as subjects_router
from routers.topics import router as topics_router
from routers.generate import router as generate_router
from routers.chat import router as chat_router
from routers.grammar import router as grammar_router
from routers.video import router as video_router

import os
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from db.limiter import limiter

allowed_origins = [
    "http://localhost:3000",
    "https://vidya-x-the-ai-coach.vercel.app",
    "https://vidyax-production.up.railway.app"
]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    subjects_router,
    prefix="/api/v1"
)

app.include_router(
    topics_router,
    prefix="/api/v1"
)

app.include_router(
    generate_router,
    prefix="/api/v1"
)

app.include_router(
    chat_router,
    prefix="/api/v1"
)

app.include_router(
    grammar_router,
    prefix="/api/v1"
)

app.include_router(
    video_router,
    prefix="/api/v1"
)