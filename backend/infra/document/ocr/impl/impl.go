/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package impl

import (
	"net/http"
	"os"

	"github.com/volcengine/volc-sdk-golang/service/visual"

	"github.com/coze-dev/coze-studio/backend/infra/document/ocr"
	"github.com/coze-dev/coze-studio/backend/infra/document/ocr/impl/ppocr"
	"github.com/coze-dev/coze-studio/backend/infra/document/ocr/impl/veocr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type OCR = ocr.OCR

func New() ocr.OCR {
	var ocr ocr.OCR
	switch os.Getenv(consts.OCRType) {
	case "ve":
		ocrAK := os.Getenv(consts.VeOCRAK)
		ocrSK := os.Getenv(consts.VeOCRSK)
		if ocrAK == "" || ocrSK == "" {
			logs.Warnf("[ve_ocr] ak / sk not configured, ocr might not work well")
		}
		inst := visual.NewInstance()
		inst.Client.SetAccessKey(ocrAK)
		inst.Client.SetSecretKey(ocrSK)
		ocr = veocr.NewOCR(&veocr.Config{Client: inst})
	case "paddleocr":
		url := os.Getenv(consts.PPOCRAPIURL)
		client := &http.Client{}
		ocr = ppocr.NewOCR(&ppocr.Config{Client: client, URL: url})
	default:
		// accept ocr not configured
	}

	return ocr
}
