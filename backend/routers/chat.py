from fastapi import APIRouter, HTTPException, Request
import os
from openai import OpenAI
from models.chat_request import ChatRequest
from db.limiter import limiter

router = APIRouter()

CEREBRAS_TEXT_MODEL = "gpt-oss-120b"
CEREBRAS_BASE_URL   = "https://api.cerebras.ai/v1"

_cerebras_client = None

def get_cerebras_client() -> OpenAI:
    global _cerebras_client
    if _cerebras_client is None:
        api_key = os.getenv("CEREBRAS_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="CEREBRAS_API_KEY not set in .env")
        _cerebras_client = OpenAI(
            api_key=api_key,
            base_url=CEREBRAS_BASE_URL,
        )
    return _cerebras_client

@router.post("/chat/analyze-mistake")
@limiter.limit("15/minute")
def analyze_mistake(request: Request, payload: ChatRequest):
    client = get_cerebras_client()
    
    # Format options
    options_formatted = "\n".join([f"  - ({k}) {v}" for k, v in payload.options.items()])
    
    # Customize system prompt based on whether they answered correctly or not
    if payload.selected_answer == payload.correct_answer:
        outcome_focus = (
            f"The student answered correctly by choosing option {payload.selected_answer}. "
            "Congratulate them briefly, help them solidify their understanding, or answer their questions about "
            "alternative approaches or other options."
        )
    else:
        outcome_focus = (
            f"The student chose option {payload.selected_answer}, which is INCORRECT. "
            f"The correct option is {payload.correct_answer}. "
            f"Explain why their choice is incorrect, analyze their conceptual mistake, and guide them clearly "
            f"towards the correct logic behind option {payload.correct_answer}."
        )
        
    system_content = f"""You are "TopperBhai AI Tutor", an encouraging, highly knowledgeable, and empathetic personal academic tutor. 
A student has generated a practice exam and is reviewing a question they answered. 
ICA Context:
- QUESTION: {payload.question}
- OPTIONS:
{options_formatted}
- CORRECT OPTION: {payload.correct_answer}
- STUDENT'S SELECTED OPTION: {payload.selected_answer}
- ORIGINAL EXPLANATION: {payload.explanation}

Your Focus:
{outcome_focus}

Your Guidelines:
1. Keep your tone supportive, warm, and encouraging (like a friendly mentor).
2. Keep answers concise, readable, and well-structured using markdown/bullets/bolding.
3. Be clear and step-by-step. If relevant, use simpler analogies.
4. If they ask about something unrelated to this question or academic topic, politely bring them back to the subject.
"""

    messages = [{"role": "system", "content": system_content}]
    
    # Add history
    for msg in payload.history:
        messages.append({"role": msg.role, "content": msg.content})
        
    # Add current message
    messages.append({"role": "user", "content": payload.message})
    
    try:
        response = client.chat.completions.create(
            model=CEREBRAS_TEXT_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        reply = response.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cerebras API call failed: {str(e)}")
