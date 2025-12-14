"""
Summary Service for document summarization with multiple formats.
"""
from __future__ import annotations

import json
import logging
import re
from typing import List, Optional

from app.schemas.summary import SummaryFormat, SummaryScope, ChapterInfo
from app.services.llm import LLMService

logger = logging.getLogger(__name__)


class SummaryService:
    """Service for document summarization with multiple formats and scopes."""

    # Prompt templates for different summary formats
    BULLET_PROMPT = """Tóm tắt nội dung tài liệu sau thành các điểm chính (bullet points).

Yêu cầu:
- Sử dụng định dạng Markdown với bullet points (-)
- Tập trung vào các thông tin quan trọng nhất
- Tối đa 10 điểm chính
- Trả lời bằng tiếng Việt
- Ngắn gọn, súc tích
- KHÔNG viết câu giới thiệu như 'Dưới đây là tóm tắt...', chỉ đưa ra các bullet points trực tiếp

Nội dung tài liệu:
{content}

Tóm tắt:"""

    EXECUTIVE_PROMPT = """Viết một bản tóm tắt điều hành (executive summary) cho tài liệu sau.

Yêu cầu:
- Viết 2-3 đoạn văn
- Bao gồm: mục tiêu chính, nội dung quan trọng, kết luận
- Giọng văn chuyên nghiệp
- Trả lời bằng tiếng Việt
- Sử dụng định dạng Markdown
- KHÔNG viết câu giới thiệu như 'Dưới đây là...', bắt đầu trực tiếp vào nội dung

Nội dung tài liệu:
{content}

Executive Summary:"""

    TABLE_PROMPT = """Tạo bảng tóm tắt có cấu trúc cho tài liệu sau bằng định dạng Markdown.

Yêu cầu:
- Tạo bảng với các cột: Chủ đề | Nội dung chính | Chi tiết
- Tối đa 8 hàng
- Ngắn gọn nhưng đầy đủ thông tin
- Trả lời bằng tiếng Việt
- KHÔNG viết câu giới thiệu, bắt đầu trực tiếp bằng bảng Markdown

Nội dung tài liệu:
{content}

Bảng tóm tắt:"""

    CHAPTER_EXTRACTION_PROMPT = """Phân tích tài liệu sau và trích xuất cấu trúc các chương/phần.

Tìm các tiêu đề chương, phần, mục dựa trên:
- Các heading có dạng "Chương X", "Phần X", "Chapter X", "Section X"
- Các tiêu đề được đánh số như "1.", "1.1", "I.", "II."
- Các dòng có định dạng heading (#, ##, ###)
- Các tiêu đề in đậm hoặc viết hoa toàn bộ

Trả về CHÍNH XÁC dạng JSON array như sau (không có text nào khác):
[
  {{"title": "Tiêu đề chương 1", "start_char": 0, "end_char": 1000}},
  {{"title": "Tiêu đề chương 2", "start_char": 1001, "end_char": 2000}}
]

Nếu không tìm thấy cấu trúc chương rõ ràng, hãy chia tài liệu thành các phần logic và đặt tên phù hợp.

Nội dung tài liệu:
{content}

JSON:"""

    CHAPTER_SUMMARY_PROMPT = """Tóm tắt phần "{chapter_title}" của tài liệu theo định dạng {format_name}.

{format_instructions}

Nội dung phần này:
{content}

Tóm tắt:"""

    FORMAT_INSTRUCTIONS = {
        SummaryFormat.BULLET: """Yêu cầu:
- Sử dụng định dạng Markdown với bullet points (-)
- Tập trung vào các thông tin quan trọng
- Tối đa 7 điểm chính
- Trả lời bằng tiếng Việt
- KHÔNG viết câu giới thiệu như 'Dưới đây là...', 'Tóm tắt:', chỉ đưa ra nội dung tóm tắt trực tiếp""",
        SummaryFormat.EXECUTIVE: """Yêu cầu:
- Viết 1-2 đoạn văn ngắn gọn
- Bao gồm nội dung chính và điểm quan trọng
- Trả lời bằng tiếng Việt
- KHÔNG viết câu giới thiệu như 'Dưới đây là...', chỉ đưa ra nội dung tóm tắt trực tiếp""",
        SummaryFormat.TABLE: """Yêu cầu:
- Tạo bảng Markdown với các cột: Chủ đề | Nội dung chính
- Tối đa 5 hàng
- Trả lời bằng tiếng Việt
- KHÔNG viết câu giới thiệu, chỉ đưa ra bảng trực tiếp"""
    }

    def __init__(self, llm_service: LLMService):
        """Initialize SummaryService with LLMService."""
        self.llm_service = llm_service
        logger.info("SummaryService initialized")

    def _get_format_prompt(self, format: SummaryFormat) -> str:
        """Get the appropriate prompt template for the given format."""
        if format == SummaryFormat.BULLET:
            return self.BULLET_PROMPT
        elif format == SummaryFormat.EXECUTIVE:
            return self.EXECUTIVE_PROMPT
        elif format == SummaryFormat.TABLE:
            return self.TABLE_PROMPT
        else:
            return self.BULLET_PROMPT

    def _truncate_content(self, content: str, max_chars: int = 15000) -> str:
        """Truncate content if too long to fit in LLM context."""
        if len(content) <= max_chars:
            return content
        
        # Truncate and add notice
        truncated = content
        # Try to end at a sentence or paragraph
        last_period = truncated.rfind('.')
        last_newline = truncated.rfind('\n')
        cut_point = max(last_period, last_newline)
        # if cut_point > max_chars * 0.8:
        #     truncated = truncated[:cut_point + 1]
        
        return truncated + "\n\n[... nội dung đã được rút gọn ...]"

    async def extract_chapters(self, content: str) -> List[ChapterInfo]:
        """
        Extract chapter/section structure from document content.
        Uses LLM to identify logical sections.
        """
        logger.info("Extracting chapters from document (length: %d chars)", len(content))
        
        # Truncate for chapter extraction (we need to see structure, not all content)
        truncated_content = self._truncate_content(content, max_chars=12000)
        
        prompt = self.CHAPTER_EXTRACTION_PROMPT.format(content=truncated_content)
        
        try:
            response = self.llm_service.generate(prompt=prompt, temperature=0.1)
            
            # Parse JSON response
            # Try to extract JSON from response
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                json_str = json_match.group()
                chapters_data = json.loads(json_str)
                
                chapters = []
                for idx, chapter in enumerate(chapters_data):
                    chapters.append(ChapterInfo(
                        index=idx,
                        title=chapter.get("title", f"Phần {idx + 1}"),
                        start_char=chapter.get("start_char", 0),
                        end_char=chapter.get("end_char", len(content))
                    ))
                
                logger.info("Extracted %d chapters from document", len(chapters))
                return chapters
            else:
                logger.warning("Could not parse chapters from LLM response")
                # Return default single chapter
                return [ChapterInfo(
                    index=0,
                    title="Toàn bộ tài liệu",
                    start_char=0,
                    end_char=len(content)
                )]
                
        except json.JSONDecodeError as e:
            logger.error("JSON parse error in chapter extraction: %s", str(e))
            return [ChapterInfo(
                index=0,
                title="Toàn bộ tài liệu",
                start_char=0,
                end_char=len(content)
            )]
        except Exception as e:
            logger.error("Error extracting chapters: %s", str(e))
            raise

    async def summarize_full(self, content: str, format: SummaryFormat) -> str:
        """
        Summarize the entire document in the specified format.
        
        Args:
            content: Full document content
            format: Desired summary format (bullet, executive, table)
            
        Returns:
            Summary string in the requested format
        """
        logger.info("Generating full document summary (format: %s, length: %d chars)", 
                   format.value, len(content))
        
        # Truncate content if needed
        truncated_content = self._truncate_content(content)
        
        # Get appropriate prompt
        prompt_template = self._get_format_prompt(format)
        prompt = prompt_template.format(content=truncated_content)
        
        try:
            response = self.llm_service.generate(prompt=prompt, temperature=0.3)
            logger.info("Full document summary generated successfully")
            return response.strip()
        except Exception as e:
            logger.error("Error generating full summary: %s", str(e))
            raise

    async def summarize_chapter(
        self,
        content: str,
        chapter: ChapterInfo,
        format: SummaryFormat
    ) -> str:
        """
        Summarize a specific chapter/section of the document.
        
        Args:
            content: Full document content
            chapter: ChapterInfo with start_char and end_char
            format: Desired summary format
            
        Returns:
            Summary string for the chapter
        """
        logger.info("Generating chapter summary (chapter: %s, format: %s)", 
                   chapter.title, format.value)
        
        # Extract chapter content
        chapter_content = content[chapter.start_char:chapter.end_char]
        
        if not chapter_content.strip():
            return "Không có nội dung trong phần này."
        
        # Truncate if needed
        truncated_content = self._truncate_content(chapter_content, max_chars=10000)
        
        # Build prompt
        format_name = {
            SummaryFormat.BULLET: "bullet points",
            SummaryFormat.EXECUTIVE: "executive summary",
            SummaryFormat.TABLE: "bảng"
        }.get(format, "bullet points")
        
        format_instructions = self.FORMAT_INSTRUCTIONS.get(format, self.FORMAT_INSTRUCTIONS[SummaryFormat.BULLET])
        
        prompt = self.CHAPTER_SUMMARY_PROMPT.format(
            chapter_title=chapter.title,
            format_name=format_name,
            format_instructions=format_instructions,
            content=truncated_content
        )
        
        try:
            response = self.llm_service.generate(prompt=prompt, temperature=0.3)
            logger.info("Chapter summary generated successfully")
            return response.strip()
        except Exception as e:
            logger.error("Error generating chapter summary: %s", str(e))
            raise

    async def summarize(
        self,
        content: str,
        scope: SummaryScope,
        format: SummaryFormat,
        chapter_indices: Optional[List[int]] = None,
        chapters: Optional[List[ChapterInfo]] = None
    ) -> tuple[str, Optional[str]]:
        """
        Main summarization method that handles both full and chapter summaries.
        
        Args:
            content: Document content
            scope: Full document or specific chapter
            format: Summary format
            chapter_indices: List of chapter indices (if scope is CHAPTER)
            chapters: List of chapters (if already extracted)
            
        Returns:
            Tuple of (summary_text, chapter_titles or None)
        """
        if scope == SummaryScope.FULL:
            summary = await self.summarize_full(content, format)
            return summary, None
        
        elif scope == SummaryScope.CHAPTER:
            if chapters is None:
                chapters = await self.extract_chapters(content)
            
            if not chapter_indices or len(chapter_indices) == 0:
                raise ValueError("chapter_indices is required when scope is CHAPTER")
            
            # Validate all indices
            for idx in chapter_indices:
                if idx < 0 or idx >= len(chapters):
                    raise ValueError(f"Invalid chapter_index: {idx}. Document has {len(chapters)} chapters.")
            
            # Summarize each selected chapter
            summaries = []
            chapter_titles = []
            
            for idx in chapter_indices:
                chapter = chapters[idx]
                chapter_summary = await self.summarize_chapter(content, chapter, format)
                summaries.append(f"### {chapter.title}\n\n{chapter_summary}")
                chapter_titles.append(chapter.title)
            
            # Combine all summaries
            combined_summary = "\n\n---\n\n".join(summaries)
            combined_titles = ", ".join(chapter_titles)
            
            return combined_summary, combined_titles
        
        else:
            raise ValueError(f"Unknown scope: {scope}")
