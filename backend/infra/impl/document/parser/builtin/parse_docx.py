import io
import os
import json
import sys
import base64
import logging
import time
from abc import ABC
from typing import List, IO

from docx import ImagePart
from docx.oxml import CT_P, CT_Tbl
from docx.table import Table
from docx.text.paragraph import Paragraph
from docx import Document
from PIL import Image

logger = logging.getLogger(__name__)

class DocxLoader(ABC):
    def __init__(
            self,
            file_content: IO[bytes],
            extract_images: bool = True,
            extract_tables: bool = True,
    ):
        self.file_content = file_content
        self.extract_images = extract_images
        self.extract_tables = extract_tables

    def load(self) -> List[dict]:
        result = []
        doc = Document(self.file_content)
        it = iter(doc.element.body)
        text = ""

        for part in it:
            blocks = self.parse_part(part, doc)
            if blocks is None or len(blocks) == 0:
                continue
            for block in blocks:
                if self.extract_images and isinstance(block, list):
                    for b in block:
                        image = io.BytesIO()
                        try:
                            Image.open(io.BytesIO(b.image.blob)).save(image, format="png")
                        except Exception as e:
                            logging.error(f"load image failed, time={time.asctime()}, err:{e}")
                            raise RuntimeError("ExtractImageError")

                        if len(text) > 0:
                            result.append(
                                {
                                    "content": text,
                                    "type": "text",
                                }
                            )
                            text = ""

                        result.append(
                            {
                                "content": base64.b64encode(image.getvalue()).decode('utf-8'),
                                "type": "image",
                            }
                        )

                if isinstance(block, Paragraph):
                    text += block.text

                if self.extract_tables and isinstance(block, Table):
                    rows = block.rows
                    if len(text) > 0:
                        result.append(
                            {
                                "content": text,
                                "type": "text",
                            }
                        )
                        text = ""
                    table = self.convert_table(rows)
                    result.append(
                        {
                            "table": table,
                            "type": "table",
                        }
                    )
            if text:
                text += "\n\n"
        if len(text) > 0:
            result.append(
                {
                    "content": text,
                    "type": "text",
                }
            )

        return result

    def parse_part(self, block, doc: Document):
        if isinstance(block, CT_P):
            blocks = []
            para = Paragraph(block, doc)
            image_part = self.get_image_part(para, doc)
            if image_part and para.text:
                blocks.extend(self.parse_run(para))
            elif image_part:
                blocks.append(image_part)
            elif para.text:
                blocks.append(para)
            return blocks
        elif isinstance(block, CT_Tbl):
            return [Table(block, doc)]

    def parse_run(self, para: Paragraph):
        runs = para.runs
        paras = []
        if runs is None or len(runs) == 0:
            return paras
        for run in runs:
            if run is None or run.element is None:
                continue
            p = Paragraph(run.element, para)
            image_part = self.get_image_part(p, para)
            if image_part:
                paras.append(image_part)
            else:
                paras.append(p)
        return paras

    @staticmethod
    def get_image_part(graph: Paragraph, doc: Document):
        images = graph._element.xpath(".//pic:pic")
        image_parts = []
        for image in images:
            for img_id in image.xpath(".//a:blip/@r:embed"):
                part = doc.part.related_parts[img_id]
                if isinstance(part, ImagePart):
                    image_parts.append(part)
        return image_parts

    @staticmethod
    def convert_table(rows) -> List[List[str]]:
        resp_rows = []
        for i, row in enumerate(rows):
            resp_row = []
            for j, cell in enumerate(row.cells):
                resp_row.append(cell.text if cell is not None else '')
            resp_rows.append(resp_row)

        return resp_rows


if __name__ == "__main__":
    w = os.fdopen(3, "wb", )
    r = os.fdopen(4, "rb", )

    try:
        req = json.load(r)
        ei, et = req['extract_images'], req['extract_tables']
        loader = DocxLoader(file_content=io.BytesIO(sys.stdin.buffer.read()), extract_images=ei, extract_tables=et)
        resp = loader.load()
        print(f"Extracted {len(resp)} items")
        result = json.dumps({"content": resp}, ensure_ascii=False)
        w.write(str.encode(result))
        w.flush()
        w.close()
        print("Docx parse done")
    except Exception as e:
        print("Docx parse error", e)
        w.write(str.encode(json.dumps({"error": str(e)})))
        w.flush()
        w.close()