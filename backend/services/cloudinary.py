from fastapi import HTTPException, UploadFile
from cloudinary.uploader import upload as cloudinary_upload
from cloudinary.exceptions import Error as CloudinaryError
import os
from typing import Optional

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
        
        result = cloudinary_upload(
            file_content,
            folder=folder,
            resource_type="auto",
            public_id=f"{folder}/{file.filename}",
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