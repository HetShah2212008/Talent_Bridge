import io

from PyPDF2 import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    combined = "\n".join(pages).strip()
    if not combined:
        raise ValueError("Could not extract text from PDF")
    return combined


def extract_resume_text(file_bytes: bytes | None, plain_text: str | None) -> str:
    if plain_text and plain_text.strip():
        return plain_text.strip()
    if file_bytes:
        return extract_text_from_pdf(file_bytes)
    raise ValueError("Provide resume text or a PDF file")
