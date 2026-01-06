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
	"fmt"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
)

var (
	spaceRegex = regexp.MustCompile(`\s+`)
	urlRegex   = regexp.MustCompile(`https?://\S+|www\.\S+`)
	emailRegex = regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
)

func ChunkCustom(_ context.Context, text string, config *contract.Config, opts ...parser.Option) (docs []*schema.Document, err error) {
	cs := config.ChunkingStrategy
	if cs.Overlap >= cs.ChunkSize {
		return nil, fmt.Errorf("[ChunkCustom] invalid param, overlap >= chunk_size")
	}

	var (
		parts         = strings.Split(text, cs.Separator)
		buffer        []rune
		currentLength int64
		options       = parser.GetCommonOptions(&parser.Options{ExtraMeta: map[string]any{}}, opts...)
	)

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

	add := func() {
		if len(buffer) == 0 {
			return
		}
		doc := &schema.Document{
			Content:  string(buffer),
			MetaData: map[string]any{},
		}
		for k, v := range options.ExtraMeta {
			doc.MetaData[k] = v
		}
		docs = append(docs, doc)
		buffer = []rune{}
	}

	processPart := func(part string) {
		runes := []rune(part)
		for partLength := int64(len(runes)); partLength > 0; partLength = int64(len(runes)) {
			pos := min(partLength, cs.ChunkSize-currentLength)
			buffer = append(buffer, runes[:pos]...)
			currentLength = int64(len(buffer))

			if currentLength >= cs.ChunkSize {
				add()
				if cs.Overlap > 0 {
					buffer = getOverlap([]rune(docs[len(docs)-1].Content), cs.Overlap, cs.ChunkSize)
					currentLength = int64(len(buffer))
				} else {
					currentLength = 0
				}
			}
			runes = runes[pos:]
		}

		add()
	}

	for _, part := range parts {
		processPart(trim(part))
	}

	add()

	return docs, nil
}

func getOverlap(runes []rune, overlapRatio int64, chunkSize int64) []rune {
	overlap := int64(float64(chunkSize) * float64(overlapRatio) / 100)
	if int64(len(runes)) <= overlap {
		return runes
	}
	return runes[len(runes)-int(overlap):]
}
