"""
Quiz Service for generating Q&A from documents using LLM.
"""
from __future__ import annotations

import json
import logging
import re
from typing import List, Optional, Tuple

from app.schemas.quiz import QuizType, QuestionType
from app.services.llm import LLMService

logger = logging.getLogger(__name__)


class QuizService:
    """Service for generating quizzes from document content."""

    SINGLE_CHOICE_PROMPT = """Bạn là một giáo viên chuyên tạo câu hỏi trắc nghiệm từ tài liệu học tập.

Dựa vào nội dung tài liệu bên dưới, hãy tạo {num_questions} câu hỏi trắc nghiệm MỘT LỰA CHỌN ĐÚNG.

Yêu cầu:
1. Mỗi câu hỏi có 4 lựa chọn (A, B, C, D)
2. Chỉ có DUY NHẤT 1 đáp án đúng
3. Câu hỏi phải bám sát nội dung tài liệu
4. Câu hỏi phải rõ ràng, không gây nhầm lẫn
5. Các lựa chọn sai phải hợp lý (không quá dễ loại bỏ)
6. Bao gồm giải thích ngắn gọn cho đáp án đúng

Trả về kết quả dưới dạng JSON với format sau:
```json
{{
  "questions": [
    {{
      "question": "Nội dung câu hỏi?",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correct_answer": 0,
      "explanation": "Giải thích ngắn gọn"
    }}
  ]
}}
```

Trong đó `correct_answer` là index (0-3) của đáp án đúng.

NỘI DUNG TÀI LIỆU:
{content}
"""

    MULTIPLE_CHOICE_PROMPT = """Bạn là một giáo viên chuyên tạo câu hỏi trắc nghiệm từ tài liệu học tập.

Dựa vào nội dung tài liệu bên dưới, hãy tạo {num_questions} câu hỏi trắc nghiệm NHIỀU LỰA CHỌN ĐÚNG.

Yêu cầu:
1. Mỗi câu hỏi có 4-5 lựa chọn
2. Có từ 2-3 đáp án đúng mỗi câu
3. Câu hỏi phải bám sát nội dung tài liệu
4. Câu hỏi phải rõ ràng, ghi rõ "Chọn tất cả đáp án đúng"
5. Bao gồm giải thích cho các đáp án đúng

Trả về kết quả dưới dạng JSON với format sau:
```json
{{
  "questions": [
    {{
      "question": "Nội dung câu hỏi? (Chọn tất cả đáp án đúng)",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correct_answers": [0, 2],
      "explanation": "Giải thích ngắn gọn"
    }}
  ]
}}
```

Trong đó `correct_answers` là danh sách các index (0-based) của các đáp án đúng.

NỘI DUNG TÀI LIỆU:
{content}
"""

    MIXED_PROMPT = """Bạn là một giáo viên chuyên tạo câu hỏi trắc nghiệm từ tài liệu học tập.

Dựa vào nội dung tài liệu bên dưới, hãy tạo {num_questions} câu hỏi trắc nghiệm KẾT HỢP cả hai loại:
- Khoảng 60% câu hỏi một lựa chọn đúng (single_choice)
- Khoảng 40% câu hỏi nhiều lựa chọn đúng (multiple_choice)

Yêu cầu:
1. Mỗi câu hỏi có 4 lựa chọn
2. Câu single_choice chỉ có 1 đáp án đúng
3. Câu multiple_choice có 2-3 đáp án đúng và ghi rõ "(Chọn tất cả đáp án đúng)"
4. Câu hỏi phải bám sát nội dung tài liệu
5. Bao gồm giải thích cho đáp án

Trả về kết quả dưới dạng JSON với format sau:
```json
{{
  "questions": [
    {{
      "question": "Nội dung câu hỏi?",
      "type": "single_choice",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correct_answers": [0],
      "explanation": "Giải thích ngắn gọn"
    }},
    {{
      "question": "Nội dung câu hỏi? (Chọn tất cả đáp án đúng)",
      "type": "multiple_choice",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correct_answers": [0, 2],
      "explanation": "Giải thích ngắn gọn"
    }}
  ]
}}
```

NỘI DUNG TÀI LIỆU:
{content}
"""

    def __init__(self, llm_service: LLMService):
        """Initialize QuizService with LLMService."""
        self.llm_service = llm_service

    def _get_prompt(self, quiz_type: QuizType) -> str:
        """Get the appropriate prompt template for the given quiz type."""
        prompts = {
            QuizType.SINGLE_CHOICE: self.SINGLE_CHOICE_PROMPT,
            QuizType.MULTIPLE_CHOICE: self.MULTIPLE_CHOICE_PROMPT,
            QuizType.MIXED: self.MIXED_PROMPT,
        }
        return prompts.get(quiz_type, self.MIXED_PROMPT)

    def _truncate_content(self, content: str, max_chars: int = 20000) -> str:
        """Truncate content if too long to fit in LLM context."""
        if len(content) <= max_chars:
            return content
        
        # Truncate at word boundary
        truncated = content
        last_space = truncated.rfind(' ')
        # if last_space > max_chars * 0.8:
        #     truncated = truncated[:last_space]
        
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

    def _normalize_questions(
        self, 
        raw_questions: List[dict], 
        quiz_type: QuizType
    ) -> List[dict]:
        """Normalize questions to consistent format."""
        normalized = []
        
        for idx, q in enumerate(raw_questions):
            question_type = QuestionType.SINGLE_CHOICE
            correct_answers = []
            
            # Determine question type and correct answers
            if quiz_type == QuizType.SINGLE_CHOICE:
                question_type = QuestionType.SINGLE_CHOICE
                # Handle both "correct_answer" (single int) and "correct_answers" (list)
                if "correct_answer" in q:
                    correct_answers = [q["correct_answer"]]
                elif "correct_answers" in q:
                    correct_answers = q["correct_answers"][:1]  # Take first only
            elif quiz_type == QuizType.MULTIPLE_CHOICE:
                question_type = QuestionType.MULTIPLE_CHOICE
                correct_answers = q.get("correct_answers", [])
            else:  # MIXED
                q_type = q.get("type", "single_choice")
                question_type = QuestionType.SINGLE_CHOICE if q_type == "single_choice" else QuestionType.MULTIPLE_CHOICE
                correct_answers = q.get("correct_answers", [])
                if not correct_answers and "correct_answer" in q:
                    correct_answers = [q["correct_answer"]]
            
            normalized.append({
                "question_text": q.get("question", ""),
                "question_type": question_type,
                "options": q.get("options", []),
                "correct_answers": correct_answers,
                "explanation": q.get("explanation", ""),
                "order_index": idx
            })
        
        return normalized

    async def generate_questions(
        self,
        content: str,
        quiz_type: QuizType,
        num_questions: int = 10
    ) -> List[dict]:
        """
        Generate quiz questions from document content.
        
        Args:
            content: Document content to generate questions from
            quiz_type: Type of quiz (single/multiple/mixed)
            num_questions: Number of questions to generate (10-30)
            
        Returns:
            List of normalized question dictionaries
        """
        # Truncate content if needed
        truncated_content = self._truncate_content(content)
        
        # Get appropriate prompt
        prompt_template = self._get_prompt(quiz_type)
        prompt = prompt_template.format(
            num_questions=num_questions,
            content=truncated_content
        )
        
        logger.info(f"Generating {num_questions} {quiz_type.value} questions")
        
        # Generate with LLM
        response = self.llm_service.generate(prompt, temperature=0.7)
        
        # Parse response
        try:
            parsed = self._parse_json_response(response)
            raw_questions = parsed.get("questions", [])
            
            if not raw_questions:
                raise ValueError("No questions found in LLM response")
            
            logger.info(f"Generated {len(raw_questions)} questions from LLM")
            
            # Normalize questions
            questions = self._normalize_questions(raw_questions, quiz_type)
            
            return questions
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response was: {response[:500]}...")
            raise ValueError(f"Failed to parse LLM response as JSON: {e}")
        except Exception as e:
            logger.error(f"Error processing LLM response: {e}")
            raise
