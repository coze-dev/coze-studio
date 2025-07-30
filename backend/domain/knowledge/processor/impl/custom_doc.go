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

import "github.com/coze-dev/coze-studio/backend/pkg/logs"

// Create a document after the user enters custom content
type customDocProcessor struct {
	baseDocProcessor
}

func (c *customDocProcessor) BeforeCreate() error {
	for i := range c.Documents {
		if c.Documents[i].RawContent != "" {
			c.Documents[i].FileExtension = getFormatType(c.Documents[i].Type)
			uri := getTosUri(c.UserID, string(c.Documents[i].FileExtension))
			err := c.storage.PutObject(c.ctx, uri, []byte(c.Documents[i].RawContent))
			if err != nil {
				logs.CtxErrorf(c.ctx, "put object failed, err: %v", err)
				return err
			}
			c.Documents[i].URI = uri
		}
	}

	return nil
}
