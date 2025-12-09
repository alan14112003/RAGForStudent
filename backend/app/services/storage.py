
import os
import logging
from pathlib import Path
from typing import Optional, BinaryIO
from datetime import timedelta
from minio import Minio
from minio.error import S3Error
from app.core.config import settings

logger = logging.getLogger(__name__)

class MinIOService:
    """Service to manage file storage with MinIO"""
    
    def __init__(
        self,
        endpoint: Optional[str] = None,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        bucket_name: Optional[str] = None,
        secure: Optional[bool] = None,
    ):
        self.endpoint = endpoint or settings.MINIO_ENDPOINT
        self.access_key = access_key or settings.MINIO_ACCESS_KEY
        self.secret_key = secret_key or settings.MINIO_SECRET_KEY
        self.bucket_name = bucket_name or settings.MINIO_BUCKET_NAME
        self.secure = secure if secure is not None else settings.MINIO_SECURE
        
        # Initialize MinIO client
        self.client = Minio(
            endpoint=self.endpoint,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=self.secure,
        )
        
        # Ensure bucket exists
        self._ensure_bucket()
        
        logger.info(f"MinIO service initialized (endpoint={self.endpoint}, bucket={self.bucket_name})")
    
    def _ensure_bucket(self) -> None:
        """Create bucket if it doesn't exist"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
            else:
                logger.debug(f"Bucket already exists: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Failed to ensure bucket exists: {e}")
            raise
    
    def upload_file(
        self,
        file_path: str | Path,
        object_name: Optional[str] = None,
        content_type: Optional[str] = None,
    ) -> str:
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if object_name is None:
            object_name = file_path.name
        
        try:
            self.client.fput_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                file_path=str(file_path),
                content_type=content_type,
            )
            
            logger.info(f"Uploaded file to MinIO: {object_name}")
            return object_name
            
        except S3Error as e:
            logger.error(f"Failed to upload file to MinIO: {e}")
            raise
    
    def upload_fileobj(
        self,
        file_data: BinaryIO,
        object_name: str,
        length: int,
        content_type: Optional[str] = None,
    ) -> str:
        try:
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                data=file_data,
                length=length,
                content_type=content_type,
            )
            
            logger.info(f"Uploaded file object to MinIO: {object_name}")
            return object_name
            
        except S3Error as e:
            logger.error(f"Failed to upload file object to MinIO: {e}")
            raise

    def get_file_url(
        self,
        object_name: str,
        expires: timedelta = timedelta(hours=1),
    ) -> str:
        try:
            url = self.client.presigned_get_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                expires=expires,
            )
            return url
        except S3Error as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            raise

    def delete_file(self, object_name: str) -> None:
        try:
            self.client.remove_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
            )
            logger.info(f"Deleted file from MinIO: {object_name}")
        except S3Error as e:
            logger.error(f"Failed to delete file from MinIO: {e}")
            raise

    def download_file(self, object_name: str, file_path: str | Path) -> None:
        try:
            self.client.fget_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                file_path=str(file_path),
            )
            logger.info(f"Downloaded file from MinIO: {object_name} to {file_path}")
        except S3Error as e:
            logger.error(f"Failed to download file from MinIO: {e}")
            raise

def get_storage_service() -> MinIOService:
    return MinIOService()
