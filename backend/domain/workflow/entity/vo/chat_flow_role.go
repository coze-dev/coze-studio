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

type ChatFlowRoleCreate struct {
	WorkflowID          int64
	CreatorID           int64
	Name                string
	Description         string
	AvatarUri           string
	BackgroundImageInfo string
	OnboardingInfo      string
	SuggestReplyInfo    string
	AudioConfig         string
	UserInputConfig     string
}

type ChatFlowRoleUpdate struct {
	WorkflowID          int64
	Name                *string
	Description         *string
	AvatarUri           *string
	BackgroundImageInfo *string
	OnboardingInfo      *string
	SuggestReplyInfo    *string
	AudioConfig         *string
	UserInputConfig     *string
}

type PublishRolePolicy struct {
	WorkflowID int64
	CreatorID  int64
	Version    string
}

type CopyRolePolicy struct {
	SourceID  int64
	TargetID  int64
	CreatorID int64
}
