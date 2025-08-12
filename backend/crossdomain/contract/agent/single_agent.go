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

package agent

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/singleagent"
)

// Requests and responses must not reference domain entities and can only use models under api/model/crossdomain.
type SingleAgent interface {
	StreamExecute(ctx context.Context, historyMsg []*message.Message, query *message.Message,
		agentRuntime *singleagent.AgentRuntime) (*schema.StreamReader[*singleagent.AgentEvent], error)
	ObtainAgentByIdentity(ctx context.Context, identity *singleagent.AgentIdentity) (*singleagent.SingleAgent, error)
}

type ResumeInfo = singleagent.InterruptInfo

type AgentEvent = singleagent.AgentEvent

var defaultSVC SingleAgent

func DefaultSVC() SingleAgent {
	return defaultSVC
}

func SetDefaultSVC(svc SingleAgent) {
	defaultSVC = svc
}
