import io
import json
import os
import sys
import base64

from typing import Literal
import pdfplumber
from PIL import Image, ImageChops
from pdfminer.pdfcolor import (
    LITERAL_DEVICE_CMYK,
)
from pdfminer.pdftypes import (
    LITERALS_DCT_DECODE,
    LITERALS_FLATE_DECODE,
)

def bbox_overlap(bbox1, bbox2):
    x0_1, y0_1, x1_1, y1_1 = bbox1
    x0_2, y0_2, x1_2, y1_2 = bbox2

    x_overlap = max(0, min(x1_1, x1_2) - max(x0_1, x0_2))
    y_overlap = max(0, min(y1_1, y1_2) - max(y0_1, y0_2))

    overlap_area = x_overlap * y_overlap

    bbox1_area = (x1_1 - x0_1) * (y1_1 - y0_1)
    bbox2_area = (x1_2 - x0_2) * (y1_2 - y0_2)
    if bbox1_area == 0 or bbox2_area == 0:
        return 0

    return overlap_area / min(bbox1_area, bbox2_area)


def is_structured_table(table):
    if not table:
        return False
    row_count = len(table)
    col_count = max(len(row) for row in table)
    return row_count >= 2 and col_count >= 2


def extract_pdf_content(pdf_data: bytes, extract_images, extract_tables: bool, filter_pages: []):
    with pdfplumber.open(io.BytesIO(pdf_data)) as pdf:
        content = []

        for page_num, page in enumerate(pdf.pages):
            if filter_pages is not None and page_num + 1 in filter_pages:
                print(f"Skip page {page_num + 1}...")
                continue
            print(f"Processing page {page_num + 1}...")
            text = page.extract_text(x_tolerance=2)
            content.append({
                'type': 'text',
                'content': text,
                'page': page_num + 1,
                'bbox': page.bbox
            })

            if extract_images:
                images = page.images
                for img_index, img in enumerate(images):
                    try:
                        filters = img['stream'].get_filters()
                        data = img['stream'].get_data()
                        buffered = io.BytesIO()

                        if filters[-1][0] in LITERALS_DCT_DECODE:
                            if LITERAL_DEVICE_CMYK in img['colorspace']:
                                i = Image.open(io.BytesIO(data))
                                i = ImageChops.invert(i)
                                i = i.convert("RGB")
                                i.save(buffered, format="PNG")
                            else:
                                buffered.write(data)

                        elif len(filters) == 1 and filters[0][0] in LITERALS_FLATE_DECODE:
                            width, height = img['srcsize']
                            channels = len(img['stream'].get_data()) / width / height / (img['bits'] / 8)
                            mode: Literal["1", "L", "RGB", "CMYK"]
                            if img['bits'] == 1:
                                mode = "1"
                            elif img['bits'] == 8 and channels == 1:
                                mode = "L"
                            elif img['bits'] == 8 and channels == 3:
                                mode = "RGB"
                            elif img['bits'] == 8 and channels == 4:
                                mode = "CMYK"
                            i = Image.frombytes(mode, img['srcsize'], data, "raw")
                            i.save(buffered, format="PNG")
                        else:
                            buffered.write(data)
                        content.append({
                            'type': 'image',
                            'content': base64.b64encode(buffered.getvalue()).decode('utf-8'),
                            'page': page_num + 1,
                            'bbox': (img['x0'], img['top'], img['x1'], img['bottom'])
                        })
                    except Exception as err:
                        print(f"Skipping an unsupported image on page {page_num + 1}, error message: {err}")

            if extract_tables:
                tables = page.extract_tables()
                for table in tables:
                    content.append({
                        'type': 'table',
                        'table': table,
                        'page': page_num + 1,
                        'bbox': page.bbox
                    })

        content.sort(key=lambda x: (x['page'], x['bbox'][1], x['bbox'][0]))

        filtered_content = []
        for item in content:
            if item['type'] == 'table':
                if is_structured_table(item['table']):
                    filtered_content.append(item)
                    continue
                overlap_found = False
                for existing_item in filtered_content:
                    if existing_item['type'] == 'text' and bbox_overlap(item['bbox'], existing_item['bbox']) > 0.8:
                        overlap_found = True
                        break
                if overlap_found:
                    continue
            filtered_content.append(item)

        return filtered_content


if __name__ == "__main__":
    w = os.fdopen(3, "wb", )
    r = os.fdopen(4, "rb", )
    pdf_data = sys.stdin.buffer.read()
    print(f"Read {len(pdf_data)} bytes of PDF data")

    try:
        req = json.load(r)
        ei, et, fp = req['extract_images'], req['extract_tables'], req['filter_pages']
        extracted_content = extract_pdf_content(pdf_data, ei, et, fp)
        print(f"Extracted {len(extracted_content)} items")
        result = json.dumps({"content": extracted_content}, ensure_ascii=False)
        w.write(str.encode(result))
        w.flush()
        w.close()
        print("Pdf parse done")
    except Exception as e:
        print("Pdf parse error", e)
        w.write(str.encode(json.dumps({"error": str(e)})))
        w.flush()
        w.close()