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

package vo

import (
	"time"

	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type DraftInfo struct {
	*DraftMeta

	Canvas          string
	InputParamsStr  string
	OutputParamsStr string

	CommitID string
}

type CanvasInfo struct {
	Canvas          string
	InputParams     []*NamedTypeInfo
	OutputParams    []*NamedTypeInfo
	InputParamsStr  string
	OutputParamsStr string
}

func (c *CanvasInfo) Unmarshal() error {
	if c.InputParamsStr != "" && len(c.InputParams) == 0 {
		var input []*NamedTypeInfo
		err := sonic.UnmarshalString(c.InputParamsStr, &input)
		if err != nil {
			return err
		}
		c.InputParams = input
	}

	if c.OutputParamsStr != "" && len(c.OutputParams) == 0 {
		var output []*NamedTypeInfo
		err := sonic.UnmarshalString(c.OutputParamsStr, &output)
		if err != nil {
			return err
		}
		c.OutputParams = output
	}

	return nil
}

type DraftMeta struct {
	TestRunSuccess bool
	Modified       bool
	Timestamp      time.Time
	IsSnapshot     bool // if true, this is a snapshot of a previous draft content, not the latest draft
}
