"""
Flashcard Service for generating flashcards from documents using LLM.
"""
from __future__ import annotations

import json
import logging
import re
from typing import List

from app.services.llm import LLMService

logger = logging.getLogger(__name__)


class FlashcardService:
    """Service for generating flashcards from document content."""

    FLASHCARD_PROMPT = """Bạn là một giáo viên chuyên tạo flashcard học tập từ tài liệu.

Dựa vào nội dung tài liệu bên dưới, hãy tạo {num_cards} flashcard để giúp học sinh ghi nhớ kiến thức.

Yêu cầu:
1. Mỗi flashcard có 2 mặt:
   - Mặt trước (front): Câu hỏi hoặc khái niệm cần nhớ
   - Mặt sau (back): Câu trả lời hoặc giải thích
2. Flashcard phải bám sát nội dung tài liệu
3. Câu hỏi phải rõ ràng, ngắn gọn
4. Câu trả lời đầy đủ nhưng súc tích
5. Đa dạng về loại câu hỏi: định nghĩa, so sánh, ví dụ, ứng dụng

Trả về kết quả dưới dạng JSON với format sau:
```json
{{
  "flashcards": [
    {{
      "front": "Câu hỏi hoặc khái niệm?",
      "back": "Câu trả lời hoặc giải thích"
    }}
  ]
}}
```

NỘI DUNG TÀI LIỆU:
{content}
"""

    def __init__(self, llm_service: LLMService):
        """Initialize FlashcardService with LLMService."""
        self.llm_service = llm_service

    def _truncate_content(self, content: str, max_chars: int = 20000) -> str:
        """Truncate content if too long to fit in LLM context."""
        if len(content) <= max_chars:
            return content
        
        # Truncate at word boundary
        truncated = content[:max_chars]
        last_space = truncated.rfind(' ')
        if last_space > max_chars * 0.8:
            truncated = truncated[:last_space]
        
        logger.warning(f"Content truncated from {len(content)} to {len(truncated)} chars")
        return truncated + "\n\n[... Nội dung đã được rút gọn ...]"

    def _parse_json_response(self, response: str) -> dict:
        """Parse JSON from LLM response, handling markdown code blocks."""
        # Try to extract JSON from markdown code block
        json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find raw JSON
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                json_str = json_match.group(0)
            else:
                raise ValueError("No JSON found in response")
        
        return json.loads(json_str)

    def _normalize_flashcards(self, raw_flashcards: List[dict]) -> List[dict]:
        """Normalize flashcards to consistent format."""
        normalized = []
        
        for idx, card in enumerate(raw_flashcards):
            normalized.append({
                "front_text": card.get("front", ""),
                "back_text": card.get("back", ""),
                "order_index": idx
            })
        
        return normalized

    async def generate_flashcards(
        self,
        content: str,
        num_cards: int = 20
    ) -> List[dict]:
        """
        Generate flashcards from document content.
        
        Args:
            content: Document content to generate flashcards from
            num_cards: Number of flashcards to generate (10-50)
            
        Returns:
            List of normalized flashcard dictionaries
        """
        # Truncate content if needed
        truncated_content = self._truncate_content(content)
        
        # Create prompt
        prompt = self.FLASHCARD_PROMPT.format(
            num_cards=num_cards,
            content=truncated_content
        )
        
        logger.info(f"Generating {num_cards} flashcards")
        
        # Generate with LLM
        response = self.llm_service.generate(prompt, temperature=0.7)
        
        # Parse response
        try:
            parsed = self._parse_json_response(response)
            raw_flashcards = parsed.get("flashcards", [])
            
            if not raw_flashcards:
                raise ValueError("No flashcards found in LLM response")
            
            logger.info(f"Generated {len(raw_flashcards)} flashcards from LLM")
            
            # Normalize flashcards
            flashcards = self._normalize_flashcards(raw_flashcards)
            
            return flashcards
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response was: {response[:500]}...")
            raise ValueError(f"Failed to parse LLM response as JSON: {e}")
        except Exception as e:
            logger.error(f"Error processing LLM response: {e}")
            raise
