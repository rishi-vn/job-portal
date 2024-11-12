import PyPDF2
import docx
import os

def parse_pdf(file_path):
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ''
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()
    return text

def parse_docx(file_path):
    doc = docx.Document(file_path)
    text = ''
    for para in doc.paragraphs:
        text += para.text
    return text

def parse_resume(file_path):
    if file_path.endswith('.pdf'):
        text = parse_pdf(file_path)
    elif file_path.endswith('.docx') or file_path.endswith('.doc'):
        text = parse_docx(file_path)
    else:
        raise ValueError('Unsupported file format')

    # Get the filename without the extension
    filename = os.path.splitext(os.path.basename(file_path))[0]

    # Save the parsed text to a .txt file
    with open(f'uploadedresumes/{filename}.txt', 'w', encoding='utf-8') as f:
        f.write(text)

    return text