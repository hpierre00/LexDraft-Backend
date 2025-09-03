from fastapi import UploadFile


def upload_blog_image(file: UploadFile) -> str:
    """
    Uploads the provided image file to storage and returns the public URL.
    This is a placeholder implementation that returns a dummy URL.
    """
    # In production, implement actual upload logic here (e.g., S3, Supabase).
    return f"https://example.com/{file.filename}"
