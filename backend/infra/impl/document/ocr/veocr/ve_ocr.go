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

package veocr

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/volcengine/volc-sdk-golang/service/visual"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/ocr"
)

type Config struct {
	Client *visual.Visual

	// see: https://www.volcengine.com/docs/6790/117730
	ApproximatePixel *int    // default: 0
	Mode             *string // default: "text_block"
	FilterThresh     *int    // default: 80
	HalfToFull       *bool   // default: false
}

func NewOCR(config *Config) ocr.OCR {
	return &ocrImpl{config}
}

type ocrImpl struct {
	config *Config
}

func (o *ocrImpl) FromBase64(ctx context.Context, b64 string) ([]string, error) {
	form := o.newForm()
	form.Add("image_base64", b64)

	resp, statusCode, err := o.config.Client.OCRNormal(form)
	if err != nil {
		return nil, err
	}
	if statusCode != http.StatusOK {
		return nil, fmt.Errorf("[FromBase64] failed, status code=%d", statusCode)
	}

	return resp.Data.LineTexts, nil
}

func (o *ocrImpl) FromURL(ctx context.Context, url string) ([]string, error) {
	form := o.newForm()
	form.Add("image_url", url)

	resp, statusCode, err := o.config.Client.OCRNormal(form)
	if err != nil {
		return nil, err
	}
	if statusCode != http.StatusOK {
		return nil, fmt.Errorf("[FromBase64] failed, status code=%d", statusCode)
	}

	return resp.Data.LineTexts, nil
}

func (o *ocrImpl) newForm() url.Values {
	form := url.Values{}
	if o.config.ApproximatePixel != nil {
		form.Add("approximate_pixel", strconv.FormatInt(int64(*o.config.ApproximatePixel), 10))
	}
	if o.config.Mode != nil {
		form.Add("mode", *o.config.Mode)
	} else {
		form.Add("mode", "text_block")
	}
	if o.config.FilterThresh != nil {
		form.Add("filter_thresh", strconv.FormatInt(int64(*o.config.FilterThresh), 10))
	}
	if o.config.HalfToFull != nil {
		form.Add("half_to_full", strconv.FormatBool(*o.config.HalfToFull))
	}
	return form
}
