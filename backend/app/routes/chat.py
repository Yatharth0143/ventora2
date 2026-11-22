from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.middleware.auth_middleware import get_current_user
from app.services import chat_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


class SendMessageRequest(BaseModel):
    receiver_id: str
    text: str


@router.post("/send")
async def send_chat_message(req: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    msg = await chat_service.send_message(
        sender_id=current_user["_id"],
        receiver_id=req.receiver_id,
        text=req.text,
        sender=current_user
    )
    return {"message": msg}


@router.get("/history/{user_id}")
async def get_chat_history(user_id: str, current_user: dict = Depends(get_current_user)):
    history = await chat_service.get_history(current_user["_id"], user_id)
    return {"messages": history}


@router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    convos = await chat_service.get_conversations(current_user["_id"])
    return {"conversations": convos}


@router.get("/user/{user_id}")
async def get_chat_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = await chat_service.get_user_profile(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user}

