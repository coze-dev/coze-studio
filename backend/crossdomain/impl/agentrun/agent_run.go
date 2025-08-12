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

package agentrun

import (
	"context"

	crossagentrun "github.com/coze-dev/coze-studio/backend/crossdomain/contract/agentrun"
	agentrun "github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/service"
)

type AgentRun interface {
	Delete(ctx context.Context, runID []int64) error
}

var defaultSVC crossagentrun.AgentRun

type impl struct {
	DomainSVC agentrun.Run
}

func InitDomainService(c agentrun.Run) crossagentrun.AgentRun {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *impl) Delete(ctx context.Context, runID []int64) error {
	return c.DomainSVC.Delete(ctx, runID)
}
