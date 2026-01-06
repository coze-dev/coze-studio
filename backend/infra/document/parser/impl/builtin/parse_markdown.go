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

package builtin

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/text"

	"github.com/coze-dev/coze-studio/backend/infra/document/ocr"
	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func ParseMarkdown(config *contract.Config, storage storage.Storage, ocr ocr.OCR) ParseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		options := parser.GetCommonOptions(&parser.Options{}, opts...)
		mdParser := goldmark.DefaultParser()
		b, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}

		node := mdParser.Parse(text.NewReader(b))
		cs := config.ChunkingStrategy
		ps := config.ParsingStrategy

		if cs.ChunkType != contract.ChunkTypeCustom && cs.ChunkType != contract.ChunkTypeDefault {
			return nil, fmt.Errorf("[ParseMarkdown] chunk type not support, chunk type=%d", cs.ChunkType)
		}

		var (
			last       *schema.Document
			emptySlice bool
		)

		addSliceContent := func(content string) {
			emptySlice = false
			last.Content += content
		}

		newSlice := func(needOverlap bool) {
			last = &schema.Document{
				MetaData: map[string]any{},
			}

			for k, v := range options.ExtraMeta {
				last.MetaData[k] = v
			}

			if needOverlap && cs.Overlap > 0 && len(docs) > 0 {
				overlap := getOverlap([]rune(docs[len(docs)-1].Content), cs.Overlap, cs.ChunkSize)
				addSliceContent(string(overlap))
			}

			emptySlice = true
		}

		pushSlice := func() {
			if !emptySlice && last.Content != "" {
				docs = append(docs, last)
				newSlice(true)
			}
		}

		trim := func(text string) string {
			if cs.TrimURLAndEmail {
				text = urlRegex.ReplaceAllString(text, "")
				text = emailRegex.ReplaceAllString(text, "")
			}
			if cs.TrimSpace {
				text = strings.TrimSpace(text)
				text = spaceRegex.ReplaceAllString(text, " ")
			}
			return text
		}

		downloadImage := func(ctx context.Context, url string) ([]byte, error) {
			client := &http.Client{Timeout: 5 * time.Second}
			req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
			if err != nil {
				return nil, fmt.Errorf("failed to create HTTP request: %w", err)
			}

			resp, err := client.Do(req)
			if err != nil {
				return nil, fmt.Errorf("failed to download image: %w", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				return nil, fmt.Errorf("failed to download image, status code: %d", resp.StatusCode)
			}

			data, err := io.ReadAll(resp.Body)
			if err != nil {
				return nil, fmt.Errorf("failed to read image content: %w", err)
			}

			return data, nil
		}

		walker := func(n ast.Node, entering bool) (ast.WalkStatus, error) {
			if !entering {
				return ast.WalkContinue, nil
			}

			switch n.Kind() {
			case ast.KindText:
				if n.HasChildren() {
					break
				}
				textNode := n.(*ast.Text)
				plainText := trim(string(textNode.Segment.Value(b)))

				for _, part := range strings.Split(plainText, cs.Separator) {
					runes := []rune(part)
					for partLength := int64(len(runes)); partLength > 0; partLength = int64(len(runes)) {
						pos := min(partLength, cs.ChunkSize-charCount(last.Content))
						chunk := runes[:pos]
						addSliceContent(string(chunk))
						runes = runes[pos:]
						if charCount(last.Content) >= cs.ChunkSize {
							pushSlice()
						}
					}
				}

			case ast.KindImage:
				if !ps.ExtractImage {
					break
				}

				imageNode := n.(*ast.Image)

				if ps.ExtractImage {
					imageURL := string(imageNode.Destination)
					if _, err = url.ParseRequestURI(imageURL); err == nil {
						sp := strings.Split(imageURL, ".")
						if len(sp) == 0 {
							return ast.WalkStop, fmt.Errorf("failed to extract image extension, url=%s", imageURL)
						}
						ext := sp[len(sp)-1]

						img, err := downloadImage(ctx, imageURL)
						if err != nil {
							return ast.WalkStop, fmt.Errorf("failed to download image: %w", err)
						}

						imgSrc, err := PutImageObject(ctx, storage, ext, GetCreatorIDFromExtraMeta(options.ExtraMeta), img)
						if err != nil {
							return ast.WalkStop, err
						}

						if !emptySlice && last.Content != "" {
							pushSlice()
						} else {
							newSlice(false)
						}

						addSliceContent(fmt.Sprintf("\n%s\n", imgSrc))

						if ps.ImageOCR && ocr != nil {
							texts, err := ocr.FromBase64(ctx, base64.StdEncoding.EncodeToString(img))
							if err != nil {
								return ast.WalkStop, fmt.Errorf("failed to perform OCR on image: %w", err)
							}
							addSliceContent(strings.Join(texts, "\n"))
						}

						if charCount(last.Content) >= cs.ChunkSize {
							pushSlice()
						}
					} else {
						logs.CtxInfof(ctx, "[ParseMarkdown] not a valid image url, skip, got=%s", imageURL)
					}
				}
			}

			return ast.WalkContinue, nil
		}

		newSlice(false)

		if err = ast.Walk(node, walker); err != nil {
			return nil, err
		}

		if !emptySlice {
			pushSlice()
		}

		return docs, nil
	}
}
