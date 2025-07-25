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

package service

// TODO: 考虑到 model manager 被外部高频读+运行，修改/删除频率很低，基本没有实时更新需求，可进行 cache
// 1. model_meta
// 2. model_entity
// 3. ChatModel

// func (m *modelManager) buildOptions(req *model.ChatRequest) []cm.Option {
//	var opts []cm.Option
//
//	if len(req.Tools) > 0 {
//		opts = append(opts, cm.WithTools(req.Tools))
//	}
//	if req.Temperature != nil {
//		opts = append(opts, cm.WithTemperature(float32(*req.Temperature)))
//	}
//	if req.MaxTokens != nil {
//		opts = append(opts, cm.WithMaxTokens(*req.MaxTokens))
//	}
//	if req.TopP != nil {
//		opts = append(opts, cm.WithTopP(float32(*req.TopP)))
//	}
//	// TODO: support frequency_penalty, presence_penalty, top_k
//	return opts
//}
