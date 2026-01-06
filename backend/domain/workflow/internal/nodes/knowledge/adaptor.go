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

package knowledge

import (
	"fmt"

	knowledge "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
)

func convertParsingType(p string) (knowledge.ParseMode, error) {
	switch p {
	case "fast":
		return knowledge.FastParseMode, nil
	case "accurate":
		return knowledge.AccurateParseMode, nil
	default:
		return "", fmt.Errorf("invalid parsingType: %s", p)
	}
}

func convertChunkType(p string) (knowledge.ChunkType, error) {
	switch p {
	case "custom":
		return knowledge.ChunkTypeCustom, nil
	case "default":
		return knowledge.ChunkTypeDefault, nil
	default:
		return "", fmt.Errorf("invalid ChunkType: %s", p)
	}
}
func convertRetrievalSearchType(s int64) (knowledge.SearchType, error) {
	switch s {
	case 0:
		return knowledge.SearchTypeSemantic, nil
	case 1:
		return knowledge.SearchTypeHybrid, nil
	case 20:
		return knowledge.SearchTypeFullText, nil
	default:
		return 0, fmt.Errorf("invalid RetrievalSearchType %v", s)
	}
}
