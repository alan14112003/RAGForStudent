
from __future__ import annotations

import logging
import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import openai
from app.services.exceptions import LLMRateLimitError
from app.core.config import settings

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

logger = logging.getLogger(__name__)


@dataclass
class LLMResponse:
    """Response from LLM"""
    answer: str
    model: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None


class LLMService:
    """Service to interact with Gemini LLM models via OpenAI compatibility"""

    DEFAULT_SYSTEM_PROMPT = """
You are an intelligent and helpful AI assistant. Your task is to answer user questions accurately.

Instructions:
1. Prioritize using information from the provided "Context" to answer.
2. ***If the answer is not in the context, use your general knowledge to answer helpfully.***
3. Cite sources when possible (e.g., "According to document X...") if information comes from documents.
4. **Answer in Vietnamese** clearly and coherently.
5. If there are multiple sources, synthesize them.
6. Format the answer using Markdown (headings, lists).
"""

    RAG_PROMPT_TEMPLATE = """Context from documents:
{context}

Question: {question}

Please answer the question based on the context above. If the context doesn't contain the necessary information, state that clearly.
Remember to answer in Vietnamese.
"""

    def __init__(
        self,
        model: str = "gemini-2.0-flash-exp",
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        temperature: float = 0.1,
        timeout: int = 120,
        max_tokens: Optional[int] = None,
    ) -> None:
        self.model = model
        self.base_url = base_url or os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai")
        self.api_key = api_key or settings.GOOGLE_API_KEY
        self.temperature = temperature
        self.timeout = timeout
        self.max_tokens = max_tokens

        if not self.api_key:
            # Fallback or warn if not set, though settings should enforce it optionally
            logger.warning("GOOGLE_API_KEY (GEMINI_API_KEY) not set")

        # Init LLM
        model_kwargs = {}
        if max_tokens is not None:
            model_kwargs["max_tokens"] = max_tokens

        self._llm = ChatOpenAI(
            model=self.model,
            base_url=self.base_url,
            api_key=self.api_key,
            temperature=self.temperature,
            timeout=self.timeout,
            **model_kwargs,
        )

        # Init prompt template
        self._rag_prompt = ChatPromptTemplate.from_messages([
            ("system", self.DEFAULT_SYSTEM_PROMPT),
            ("human", self.RAG_PROMPT_TEMPLATE),
        ])

        # Init chain
        self._rag_chain = self._rag_prompt | self._llm | StrOutputParser()

        logger.info(
            f"LLMService initialized with model={self.model}, "
            f"base_url={self.base_url}, temperature={self.temperature}"
        )

    def answer_with_context(
        self,
        question: str,
        context: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        if not question or not question.strip():
            raise ValueError("Question must not be empty")

        if not context or not context.strip():
            logger.warning("Empty context provided, answering without context")
            context = "Không có thông tin liên quan được tìm thấy trong tài liệu."

        try:
            # Override temperature if provided
            if temperature is not None:
                self._llm.temperature = temperature

            logger.info(f"Generating answer for question: '{question[:100]}...'")

            # Invoke chain
            answer = self._rag_chain.invoke({
                "context": context,
                "question": question,
            })

            logger.info("Answer generated successfully")
            
            # Reset temperature acts weird on instances, ideally we create new chain or clone, 
            # but for this simple service we just set it back if we change it globally.
            # In concurrent env, this is bad practice to change self._llm.temperature on the fly.
            # But adapting strictly from template logic for now.
            if temperature is not None:
                self._llm.temperature = self.temperature

            return LLMResponse(
                answer=answer.strip(),
                model=self.model,
            )

        except openai.RateLimitError as e:
            logger.error(f"LLM Rate Limit exceeded: {str(e)}")
            raise LLMRateLimitError("Hệ thống đang quá tải (Rate Limit Exceeded). Vui lòng thử lại sau giây lát.")
        except Exception as e:
            logger.error(f"Failed to generate answer: {str(e)}", exc_info=True)
            raise

    def answer_with_sources(
        self,
        question: str,
        sources: List[Dict[str, Any]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        if not sources:
            context = "Không tìm thấy thông tin liên quan trong tài liệu."
        else:
            context_parts = []
            for idx, source in enumerate(sources, 1):
                file_name = source.get("file_name", "Unknown")
                content = source.get("content", "")
                score = source.get("score", 0.0)
                
                context_parts.append(
                    f"[Nguồn {idx} - {file_name} (độ liên quan: {score:.2f})]\n{content}"
                )
            
            context = "\n\n---\n\n".join(context_parts)

        return self.answer_with_context(
            question=question,
            context=context,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    def generate(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        try:
            if temperature is not None:
                self._llm.temperature = temperature

            response = self._llm.invoke(prompt)
            
            if temperature is not None:
                self._llm.temperature = self.temperature

            return response.content.strip()

        except openai.RateLimitError as e:
            logger.error(f"LLM Rate Limit exceeded: {str(e)}")
            raise LLMRateLimitError("Hệ thống đang quá tải (Rate Limit Exceeded). Vui lòng thử lại sau giây lát.")
        except Exception as e:
            logger.error(f"Failed to generate text: {str(e)}", exc_info=True)
            raise

    def build_answer_payload(self, answer_text: str, sources: List[Dict[str, Any]]) -> Dict[str, Any]:
        references: List[Dict[str, Any]] = []

        for idx, source in enumerate(sources, start=1):
            source_id = source.get("source_id") or f"S{idx}"
            file_name = source.get("file_name", "unknown")
            document_id = source.get("document_id", "unknown")
            chunk_index = source.get("chunk_index", 0)
            score = float(source.get("score", 0.0))
            snippet = source.get("content", "")
            start_char = source.get("start_char", 0)
            end_char = source.get("end_char", 0)
            source_path = source.get("source_path") # Minio path

            explanation = (
                f"Excerpt from {file_name}, chunk #{chunk_index} "
                f"(chars {start_char}-{end_char})"
            )

            references.append(
                {
                    "source_id": source_id,
                    "document_id": document_id,
                    "file_name": file_name,
                    "chunk_index": chunk_index,
                    "score": score,
                    "snippet": snippet,
                    "start_char": start_char,
                    "end_char": end_char,
                    "source_path": source_path,
                    "explanation": explanation,
                    "content_format": "markdown",
                }
            )

        return {
            "content": answer_text,
            "references": references,
        }
