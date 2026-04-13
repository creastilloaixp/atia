import pdfplumber

with pdfplumber.open('GUIA CORRETAJE.pdf') as pdf:
    with open('pdf_content_utf8.txt', 'w', encoding='utf-8') as f:
        f.write(f"Total páginas: {len(pdf.pages)}\n")
        for i, page in enumerate(pdf.pages):
            f.write(f"\n{'='*60}\n")
            f.write(f"PAGINA {i+1}\n")
            f.write('='*60 + '\n')
            text = page.extract_text(x_tolerance=3, y_tolerance=3)
            if text:
                f.write(text + '\n')
            
            tables = page.extract_tables()
            if tables:
                f.write(f"\n--- TABLAS EN PAGINA {i+1} ---\n")
                for t_idx, table in enumerate(tables):
                    f.write(f"Tabla {t_idx+1}:\n")
                    for row in table:
                        f.write(" | ".join([str(c) if c else '' for c in row]) + '\n')
