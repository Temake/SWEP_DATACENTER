from fastapi import HTTPException, UploadFile
from cloudinary.uploader import upload as cloudinary_upload, destroy as cloudinary_destroy
from cloudinary.exceptions import Error as CloudinaryError
import os
from typing import Optional
import re

MAX_FILE_SIZE = 20 * 1024 * 1024

ALLOWED_FILE_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
}

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".ppt", ".pptx"}

def validate_file(file: UploadFile) -> None:
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File size too large. Maximum allowed size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, PPT, PPTX"
        )
    
    if file.filename:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Invalid file extension. Allowed extensions: .pdf, .doc, .docx, .txt, .ppt, .pptx"
            )

async def upload_file_to_cloudinary(file: UploadFile, folder: str = "scholar_base/documents") -> str:
    validate_file(file)
    
    try:
        file_content = await file.read()
        
        # Remove extension from filename to avoid duplication
        filename_without_ext = os.path.splitext(file.filename)[0] if file.filename else "document"
        
        result = cloudinary_upload(
            file_content,
            folder=folder,
            resource_type="raw",  # Use 'raw' for non-image files like PDFs
            public_id=filename_without_ext,  # Don't include folder in public_id
            overwrite=True
        )
        
        return result["secure_url"]
    
    except CloudinaryError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during file upload: {str(e)}"
        )
    finally:
        await file.seek(0)


def extract_public_id_from_url(cloudinary_url: str) -> tuple[Optional[str], Optional[str]]:
    try:
        # Pattern to match Cloudinary URLs and extract resource type and public_id
        pattern = r"https://res\.cloudinary\.com/[^/]+/([^/]+)/upload/(?:v\d+/)?(.+?)(?:\.[^.]+)?$"
        match = re.search(pattern, cloudinary_url)
        if match:
            resource_type = match.group(1)  
            public_id = match.group(2)
            return public_id, resource_type
        return None, None
    except Exception:
        return None, None


def delete_file_from_cloudinary(cloudinary_url: str) -> bool:
    try:
        public_id, resource_type = extract_public_id_from_url(cloudinary_url)
        if not public_id or not resource_type:
            print(f"Could not extract public_id or resource_type from URL: {cloudinary_url}")
            return False
        
        print(f"Attempting to delete: public_id='{public_id}', resource_type='{resource_type}'")
        
        result = cloudinary_destroy(public_id, resource_type=resource_type)
        success = result.get("result") == "ok"
        
        if success:
            print(f"Successfully deleted file from Cloudinary: {public_id}")
        else:
            print(f"Failed to delete file from Cloudinary. Result: {result}")
        
        return success
    
    except CloudinaryError as e:
        print(f"Failed to delete file from Cloudinary: {str(e)}")
        return False
    except Exception as e:
        print(f"Unexpected error during file deletion: {str(e)}")
        return False