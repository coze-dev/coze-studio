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

type EventType int64

const (
	EventType_LocalPlugin         EventType = 1
	EventType_Question            EventType = 2
	EventType_RequireInfos        EventType = 3
	EventType_SceneChat           EventType = 4
	EventType_InputNode           EventType = 5
	EventType_WorkflowLocalPlugin EventType = 6
	EventType_OauthPlugin         EventType = 7
	EventType_WorkflowLLM         EventType = 100
)
