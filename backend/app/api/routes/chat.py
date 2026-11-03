from typing import List
from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ResourceNotFoundException
from app.core.logging import get_logger
from app.schemas.rag import (
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
    ChatSource,
    ConversationHistoryResponse,
)
from app.services.rag_service import rag_service

logger = get_logger("app.api.chat")
router = APIRouter(tags=["RAG Chatbot"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a Question About an Indexed Repository (RAG)",
    description=(
        "Retrieves semantically relevant documentation chunks from pgvector for the target repository "
        "and uses Mistral AI to synthesize an accurate, source-cited answer."
    ),
)
async def chat_with_repository(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    logger.info("Received RAG chat request on repository '%s': '%s'", payload.repository_id, payload.question)
    return await rag_service.answer_question(
        repo_id_or_slug=payload.repository_id,
        question=payload.question,
        db=db,
        conversation_id=payload.conversation_id,
    )


@router.get(
    "/chat/{conversation_id}/messages",
    response_model=ConversationHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Conversation Message History",
    description="Retrieves the full list of user questions and AI responses for an ongoing chat session.",
)
async def get_conversation_history(
    conversation_id: str = Path(..., min_length=1, max_length=100, description="Conversation session UUID"),
    db: AsyncSession = Depends(get_db),
) -> ConversationHistoryResponse:
    logger.info("Fetching message history for conversation id='%s'", conversation_id)
    messages = await rag_service.get_conversation_history(conversation_id, db)

    if not messages:
        raise ResourceNotFoundException(
            f"Conversation '{conversation_id}' was not found or has no messages.",
            details={"conversation_id": conversation_id},
        )

    # Resolve repository id from first message if available
    first_msg = messages[0]
    repo_id = 0
    if hasattr(first_msg, "conversation") and first_msg.conversation:
        repo_id = first_msg.conversation.repository_id

    formatted_msgs: List[ChatMessageResponse] = []
    for msg in messages:
        sources: List[ChatSource] = []
        if msg.sources and isinstance(msg.sources, list):
            for s in msg.sources:
                if isinstance(s, dict):
                    sources.append(ChatSource(**s))

        formatted_msgs.append(
            ChatMessageResponse(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                sources=sources,
                created_at=msg.created_at.isoformat() if msg.created_at else "",
            )
        )

    return ConversationHistoryResponse(
        conversation_id=conversation_id,
        repository_id=repo_id,
        messages=formatted_msgs,
    )
