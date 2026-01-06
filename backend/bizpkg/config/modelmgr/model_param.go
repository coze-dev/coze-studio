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

package modelmgr

import (
	config "github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type Model struct {
	*config.Model
}

const (
	temperature      = "temperature"
	maxTokens        = "max_tokens"
	topP             = "top_p"
	topK             = "top_k"
	responseFormat   = "response_format"
	frequencyPenalty = "frequency_penalty"
	presencePenalty  = "presence_penalty"
)

func (m *Model) GetDefaultTemperature() *float64 {
	for _, param := range m.Parameters {
		if param.Name == temperature && param.DefaultVal != nil {
			t, err := conv.StrToFloat64(param.DefaultVal.DefaultVal)
			if err != nil {
				return nil
			}

			return ptr.Of(t)
		}
	}

	return nil
}

func (m *Model) GetDefaultMaxTokens() *int32 {
	for _, param := range m.Parameters {
		if param.Name == maxTokens && param.DefaultVal != nil {
			t, err := conv.StrToInt64(param.DefaultVal.DefaultVal)
			if err != nil {
				return nil
			}

			return ptr.Of(int32(t))
		}
	}

	return nil
}

func (m *Model) GetDefaultTopP() *float64 {
	for _, param := range m.Parameters {
		if param.Name == topP && param.DefaultVal != nil {
			t, err := conv.StrToFloat64(param.DefaultVal.DefaultVal)
			if err != nil {
				return nil
			}

			return ptr.Of(t)
		}
	}

	return nil
}

// func (m *Model) GetDefaultResponseFormat() *config.ResponseFormat {
// 	for _, param := range m.Parameters {
// 		if param.Name == responseFormat && param.DefaultVal != nil {
// 			t, err := conv.StrToResponseFormat(param.DefaultVal.DefaultVal)
// 			if err != nil {
// 				return nil
// 			}

// 			return ptr.Of(t)
// 		}
// 	}

// 	return nil
// }

func (m *Model) GetDefaultFrequencyPenalty() *float64 {
	for _, param := range m.Parameters {
		if param.Name == frequencyPenalty && param.DefaultVal != nil {
			t, err := conv.StrToFloat64(param.DefaultVal.DefaultVal)
			if err != nil {
				return nil
			}

			return ptr.Of(t)
		}
	}

	return nil
}

func (m *Model) GetDefaultPresencePenalty() *float64 {
	for _, param := range m.Parameters {
		if param.Name == presencePenalty && param.DefaultVal != nil {
			t, err := conv.StrToFloat64(param.DefaultVal.DefaultVal)
			if err != nil {
				return nil
			}

			return ptr.Of(t)
		}
	}

	return nil
}

func (m *Model) GetDefaultTopK() *int32 {
	for _, param := range m.Parameters {
		if param.Name == topK && param.DefaultVal != nil {
			t, err := conv.StrToInt64(param.DefaultVal.DefaultVal)
			if err != nil {
				return nil
			}

			return ptr.Of(int32(t))
		}
	}

	return nil
}
