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

package ppocr

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"

	"github.com/coze-dev/coze-studio/backend/infra/document/ocr"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type Config struct {
	Client *http.Client
	URL    string

	// see: https://paddlepaddle.github.io/PaddleX/latest/pipeline_usage/tutorials/ocr_pipelines/OCR.html#3
	UseDocOrientationClassify *bool
	UseDocUnwarping           *bool
	UseTextlineOrientation    *bool
	TextDetLimitSideLen       *int
	TextDetLimitType          *string
	TextDetThresh             *float64
	TextDetBoxThresh          *float64
	TextDetUnclipRatio        *float64
	TextRecScoreThresh        *float64
}

func NewOCR(config *Config) ocr.OCR {
	return &ppocrImpl{config}
}

type ppocrImpl struct {
	config *Config
}

type ppocrResponse struct {
	Result *ppocrInferResult `json:"result"`
}

type ppocrInferResult struct {
	OCRResults []*ppocrInnerResult `json:"ocrResults"`
}

type ppocrInnerResult struct {
	PrunedResult *ppocrPrunedResult `json:"prunedResult"`
}

type ppocrPrunedResult struct {
	RecTexts []string `json:"rec_texts"`
}

func (o *ppocrImpl) FromBase64(ctx context.Context, b64 string) ([]string, error) {
	return o.makeRequest(o.newRequestBody(b64))
}

func (o *ppocrImpl) FromURL(ctx context.Context, url string) ([]string, error) {
	return o.makeRequest(o.newRequestBody(url))
}

func (o *ppocrImpl) newRequestBody(file string) map[string]interface{} {
	payload := map[string]interface{}{
		"file":      file,
		"fileType":  1,
		"visualize": false,
	}
	if o.config.UseDocOrientationClassify != nil {
		payload["useDocOrientationClassify"] = *o.config.UseDocOrientationClassify
	} else {
		payload["useDocOrientationClassify"] = false
	}
	if o.config.UseDocUnwarping != nil {
		payload["useDocUnwarping"] = *o.config.UseDocUnwarping
	} else {
		payload["useDocUnwarping"] = false
	}
	if o.config.UseTextlineOrientation != nil {
		payload["useTextlineOrientation"] = *o.config.UseTextlineOrientation
	} else {
		payload["useTextlineOrientation"] = false
	}
	if o.config.TextDetLimitSideLen != nil {
		payload["textDetLimitSideLen"] = *o.config.TextDetLimitSideLen
	}
	if o.config.TextDetLimitType != nil {
		payload["textDetLimitType"] = *o.config.TextDetLimitType
	}
	if o.config.TextDetThresh != nil {
		payload["textDetThresh"] = *o.config.TextDetThresh
	}
	if o.config.TextDetUnclipRatio != nil {
		payload["textDetUnclipRatio"] = *o.config.TextDetUnclipRatio
	}
	if o.config.TextRecScoreThresh != nil {
		payload["textRecScoreThresh"] = *o.config.TextRecScoreThresh
	}
	return payload
}

func (o *ppocrImpl) makeRequest(reqBody map[string]interface{}) ([]string, error) {
	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrKnowledgeNonRetryableCode)
	}

	req, err := http.NewRequest("POST", o.config.URL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrKnowledgeNonRetryableCode)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := o.config.Client.Do(req)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrKnowledgeNonRetryableCode)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errorx.WrapByCode(err, errno.ErrKnowledgeNonRetryableCode)
	}

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrKnowledgeNonRetryableCode)
	}

	var res ppocrResponse
	if err := json.Unmarshal(respBody, &res); err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrKnowledgeNonRetryableCode)
	}

	if res.Result == nil ||
		res.Result.OCRResults == nil ||
		len(res.Result.OCRResults) != 1 ||
		res.Result.OCRResults[0] == nil ||
		res.Result.OCRResults[0].PrunedResult == nil ||
		res.Result.OCRResults[0].PrunedResult.RecTexts == nil {
		return nil, errorx.WrapByCode(err, errno.ErrKnowledgeNonRetryableCode)
	}

	return res.Result.OCRResults[0].PrunedResult.RecTexts, nil
}
