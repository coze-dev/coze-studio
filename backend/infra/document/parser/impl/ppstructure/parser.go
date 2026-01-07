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

package ppstructure

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/infra/document/ocr"
	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser/impl/builtin"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
)

type ppstructureParser struct {
	parserConfig *contract.Config
	apiConfig    *APIConfig
	fileType     int
	ocr          ocr.OCR
	storage      storage.Storage
}

type APIConfig struct {
	Client *http.Client
	URL    string

	// see: https://paddlepaddle.github.io/PaddleX/latest/pipeline_usage/tutorials/ocr_pipelines/PP-StructureV3.html#3
	UseDocOrientationClassify        *bool
	UseDocUnwarping                  *bool
	UseTextlineOrientation           *bool
	UseSealRecognition               *bool
	UseFormulaRecognition            *bool
	UseChartRecognition              *bool
	UseRegionDetection               *bool
	LayoutThreshold                  *float64
	LayoutNms                        *bool
	LayoutUnclipRatio                *float64
	LayoutMergeBboxesMode            *string
	TextDetLimitSideLen              *int64
	TextDetLimitType                 *string
	TextDetThresh                    *float64
	TextDetBoxThresh                 *float64
	TextDetUnclipRatio               *float64
	TextRecScoreThresh               *float64
	SealDetLimitSideLen              *int64
	SealDetLimitType                 *string
	SealDetThresh                    *float64
	SealDetBoxThresh                 *float64
	SealDetUnclipRatio               *float64
	SealRecScoreThresh               *float64
	UseWiredTableCellsTransToHtml    *bool
	UseWirelessTableCellsTransToHtml *bool
	UseTableOrientationClassify      *bool
	UseOcrResultsWithTableCells      *bool
	UseE2eWiredTableRecModel         *bool
	UseE2eWirelessTableRecModel      *bool
}

type ppstructureResponse struct {
	Result *ppstructureInferResult `json:"result"`
}

type ppstructureInferResult struct {
	LayoutParsingResults []*ppstructureInnerResult `json:"layoutParsingResults"`
}

type ppstructureInnerResult struct {
	Markdown *ppstructureMarkdown `json:"markdown"`
}

type ppstructureMarkdown struct {
	Text    *string           `json:"text"`
	Images  map[string]string `json:"images"`
	IsStart *bool             `json:"isStart"`
	IsEnd   *bool             `json:"isEnd"`
}

func (p *ppstructureParser) Parse(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
	// TODO(Bobholamovic): Current chunking strategy is rather naive; we should
	// implement a more sophisticated one that at least takes tables and text
	// extracted from the images into consideration.
	options := parser.GetCommonOptions(&parser.Options{ExtraMeta: map[string]any{}}, opts...)

	fileBytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, fmt.Errorf("[Parse] failed to read the file bytes, %w", err)
	}

	b64 := base64.StdEncoding.EncodeToString(fileBytes)

	reqBody := p.newRequestBody(b64, p.fileType, p.parserConfig.ParsingStrategy.ExtractImage, p.parserConfig.ParsingStrategy.ExtractTable)

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("[Parse] failed to serizalize the request body, %w", err)
	}

	req, err := http.NewRequest("POST", p.apiConfig.URL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("[Parse] failed to create a new request, %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Client-Platform", "coze")

	resp, err := p.apiConfig.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("[Parse] request failed, %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("[Parse] request failed, %w", err)
	}

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("[Parse] failed to read the response body, %w", err)
	}

	var res ppstructureResponse
	if err := json.Unmarshal(respBody, &res); err != nil {
		return nil, fmt.Errorf("[Parse] failed to deserialize the response body, %w", err)
	}

	if res.Result == nil ||
		res.Result.LayoutParsingResults == nil {
		return nil, fmt.Errorf("[Parse] failed to get the layout parsing result, %w", err)
	}

	for i, item := range res.Result.LayoutParsingResults {
		if item.Markdown == nil {
			return nil, fmt.Errorf("[Parse] invalid response, %w", err)
		}
		if item.Markdown.Text == nil {
			return nil, fmt.Errorf("[Parse] invalid response, %w", err)
		}

		should_skip := false
		for _, v := range p.parserConfig.ParsingStrategy.FilterPages {
			if i+1 == v {
				should_skip = true
				break
			}
		}
		if should_skip {
			continue
		}

		text := *item.Markdown.Text
		// Convert the image in markdown to comments, as the image content will be added later.
		pattern := `(?i)<img[^>]*>`
		re := regexp.MustCompile(pattern)
		// TODO(Bobholamovic): Add image numbering
		text = re.ReplaceAllStringFunc(text, func(matched string) string {
			return "<!-- image -->"
		})

		partDocs, err := builtin.ChunkCustom(ctx, text, p.parserConfig, opts...)
		if err != nil {
			return nil, fmt.Errorf("[Parse] chunk text failed, %w", err)
		}
		docs = append(docs, partDocs...)

		if p.parserConfig.ParsingStrategy.ExtractImage {
			if item.Markdown.Images == nil {
				return nil, fmt.Errorf("[Parse] invalid response, %w", err)
			}
			for _, v := range item.Markdown.Images {
				image, err := base64.StdEncoding.DecodeString(v)
				if err != nil {
					return nil, fmt.Errorf("[Parse] failed to decode an image, %w", err)
				}

				imgSrc, err := builtin.PutImageObject(ctx, p.storage, "png", builtin.GetCreatorIDFromExtraMeta(options.ExtraMeta), image)
				if err != nil {
					return nil, err
				}
				label := fmt.Sprintf("\n%s", imgSrc)

				if p.parserConfig.ParsingStrategy.ImageOCR && p.ocr != nil {
					texts, err := p.ocr.FromBase64(ctx, v)
					if err != nil {
						return nil, fmt.Errorf("[Parse] FromBase64 failed, %w", err)
					}
					label += strings.Join(texts, "\n")
				}

				doc := &schema.Document{
					Content:  label,
					MetaData: map[string]any{},
				}
				for k, v := range options.ExtraMeta {
					doc.MetaData[k] = v
				}
				docs = append(docs, doc)
			}
		}

	}

	return docs, nil
}

func (p *ppstructureParser) newRequestBody(file string, fileType int, extractImage bool, extractTable bool) map[string]interface{} {
	payload := map[string]interface{}{
		"file":                file,
		"fileType":            fileType,
		"useTableRecognition": extractTable,
		"visualize":           extractImage,
	}

	if p.apiConfig.UseDocOrientationClassify != nil {
		payload["useDocOrientationClassify"] = *p.apiConfig.UseDocOrientationClassify
	}
	if p.apiConfig.UseDocUnwarping != nil {
		payload["useDocUnwarping"] = *p.apiConfig.UseDocUnwarping
	}
	if p.apiConfig.UseTextlineOrientation != nil {
		payload["useTextlineOrientation"] = *p.apiConfig.UseTextlineOrientation
	}
	if p.apiConfig.UseSealRecognition != nil {
		payload["useSealRecognition"] = *p.apiConfig.UseSealRecognition
	}
	if p.apiConfig.UseFormulaRecognition != nil {
		payload["useFormulaRecognition"] = *p.apiConfig.UseFormulaRecognition
	}
	if p.apiConfig.UseChartRecognition != nil {
		payload["useChartRecognition"] = *p.apiConfig.UseChartRecognition
	}
	if p.apiConfig.UseRegionDetection != nil {
		payload["useRegionDetection"] = *p.apiConfig.UseRegionDetection
	}
	if p.apiConfig.LayoutThreshold != nil {
		payload["layoutThreshold"] = *p.apiConfig.LayoutThreshold
	}
	if p.apiConfig.LayoutNms != nil {
		payload["layoutNms"] = *p.apiConfig.LayoutNms
	}
	if p.apiConfig.LayoutUnclipRatio != nil {
		payload["layoutUnclipRatio"] = *p.apiConfig.LayoutUnclipRatio
	}
	if p.apiConfig.LayoutMergeBboxesMode != nil {
		payload["layoutMergeBboxesMode"] = *p.apiConfig.LayoutMergeBboxesMode
	}
	if p.apiConfig.TextDetLimitSideLen != nil {
		payload["textDetLimitSideLen"] = *p.apiConfig.TextDetLimitSideLen
	}
	if p.apiConfig.TextDetLimitType != nil {
		payload["textDetLimitType"] = *p.apiConfig.TextDetLimitType
	}
	if p.apiConfig.TextDetThresh != nil {
		payload["textDetThresh"] = *p.apiConfig.TextDetThresh
	}
	if p.apiConfig.TextDetBoxThresh != nil {
		payload["textDetBoxThresh"] = *p.apiConfig.TextDetBoxThresh
	}
	if p.apiConfig.TextDetUnclipRatio != nil {
		payload["textDetUnclipRatio"] = *p.apiConfig.TextDetUnclipRatio
	}
	if p.apiConfig.TextRecScoreThresh != nil {
		payload["textRecScoreThresh"] = *p.apiConfig.TextRecScoreThresh
	}
	if p.apiConfig.SealDetLimitSideLen != nil {
		payload["sealDetLimitSideLen"] = *p.apiConfig.SealDetLimitSideLen
	}
	if p.apiConfig.SealDetLimitType != nil {
		payload["sealDetLimitType"] = *p.apiConfig.SealDetLimitType
	}
	if p.apiConfig.SealDetThresh != nil {
		payload["sealDetThresh"] = *p.apiConfig.SealDetThresh
	}
	if p.apiConfig.SealDetBoxThresh != nil {
		payload["sealDetBoxThresh"] = *p.apiConfig.SealDetBoxThresh
	}
	if p.apiConfig.SealDetUnclipRatio != nil {
		payload["sealDetUnclipRatio"] = *p.apiConfig.SealDetUnclipRatio
	}
	if p.apiConfig.SealRecScoreThresh != nil {
		payload["sealRecScoreThresh"] = *p.apiConfig.SealRecScoreThresh
	}
	if p.apiConfig.UseWiredTableCellsTransToHtml != nil {
		payload["useWiredTableCellsTransToHtml"] = *p.apiConfig.UseWiredTableCellsTransToHtml
	}
	if p.apiConfig.UseWirelessTableCellsTransToHtml != nil {
		payload["useWirelessTableCellsTransToHtml"] = *p.apiConfig.UseWirelessTableCellsTransToHtml
	}
	if p.apiConfig.UseTableOrientationClassify != nil {
		payload["useTableOrientationClassify"] = *p.apiConfig.UseTableOrientationClassify
	}
	if p.apiConfig.UseOcrResultsWithTableCells != nil {
		payload["useOcrResultsWithTableCells"] = *p.apiConfig.UseOcrResultsWithTableCells
	}
	if p.apiConfig.UseE2eWiredTableRecModel != nil {
		payload["useE2eWiredTableRecModel"] = *p.apiConfig.UseE2eWiredTableRecModel
	}
	if p.apiConfig.UseE2eWirelessTableRecModel != nil {
		payload["useE2eWirelessTableRecModel"] = *p.apiConfig.UseE2eWirelessTableRecModel
	}

	return payload
}
