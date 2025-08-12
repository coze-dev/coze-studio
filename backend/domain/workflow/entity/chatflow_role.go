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

package entity

import "time"

type ChatFlowRole struct {
	ID                  int64
	WorkflowID          int64
	ConnectorID         int64
	Name                string
	Description         string
	Version             string
	AvatarUri           string
	BackgroundImageInfo string
	OnboardingInfo      string
	SuggestReplyInfo    string
	AudioConfig         string
	UserInputConfig     string
	CreatorID           int64
	CreatedAt           time.Time
	UpdatedAt           time.Time
}
