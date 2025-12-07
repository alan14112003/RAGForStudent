
class LLMRateLimitError(Exception):
    """Raised when LLM rate limit is exceeded"""
    pass

class ServiceError(Exception):
    """Base class for service errors"""
    pass
