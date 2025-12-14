"""
Cross Encoder Reranker for RAG Pipeline.

Uses sentence-transformers CrossEncoder to rerank retrieved documents
for improved relevance scoring.
"""

import logging
from typing import List, Tuple

from langchain_core.documents import Document
from sentence_transformers import CrossEncoder

logger = logging.getLogger(__name__)


class CrossEncoderReranker:
    """
    Reranker using Cross Encoder model for better relevance scoring.
    
    Cross Encoder models score query-document pairs directly, providing
    more accurate relevance scores than vector similarity alone.
    """
    
    _instance: 'CrossEncoderReranker | None' = None
    _cross_encoder: CrossEncoder | None = None
    
    def __new__(cls, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        """Singleton pattern to avoid loading model multiple times."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._model_name = model_name
            cls._instance._cross_encoder = None
        return cls._instance
    
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self._model_name = model_name
    
    def _get_encoder(self) -> CrossEncoder:
        """Lazy load Cross Encoder model."""
        if self._cross_encoder is None:
            logger.info(f"Loading Cross Encoder model: {self._model_name}")
            self._cross_encoder = CrossEncoder(self._model_name)
            logger.info("Cross Encoder model loaded successfully")
        return self._cross_encoder
    
    def rerank(
        self,
        query: str,
        documents: List[Tuple[Document, float]],
        top_k: int = 5,
    ) -> List[Tuple[Document, float]]:
        """
        Rerank documents using Cross Encoder.
        
        Args:
            query: The search query
            documents: List of (Document, score) tuples from initial retrieval
            top_k: Number of documents to return after reranking
            
        Returns:
            Reranked list of (Document, cross_encoder_score) tuples
        """
        if not documents:
            return []
        
        if len(documents) <= 1:
            return documents
        
        encoder = self._get_encoder()
        
        # Prepare pairs for cross-encoder: [query, document_content]
        pairs = [[query, doc.page_content] for doc, _ in documents]
        
        logger.info(f"Reranking {len(documents)} documents with Cross Encoder")
        
        # Get cross-encoder scores
        scores = encoder.predict(pairs)
        
        # Combine documents with new scores and sort
        scored_docs = list(zip([doc for doc, _ in documents], scores))
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        
        # Log top scores for debugging
        top_scores = [f"{score:.3f}" for _, score in scored_docs[:top_k]]
        logger.info(f"Reranked results: top scores = [{', '.join(top_scores)}]")
        
        # Return top_k reranked documents
        return [(doc, float(score)) for doc, score in scored_docs[:top_k]]


# Global singleton instance
_reranker: CrossEncoderReranker | None = None


def get_reranker(model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2") -> CrossEncoderReranker:
    """Get or create the global reranker instance."""
    global _reranker
    if _reranker is None:
        _reranker = CrossEncoderReranker(model_name)
    return _reranker
